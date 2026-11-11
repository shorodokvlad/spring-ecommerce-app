package com.shv.Ecommerce.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.io.InputStream;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

/**
 * HTTP client for the Python AI service. Responses are passed through as raw JSON strings:
 * Spring doesn't need to understand them, and strings cache cleanly in Redis.
 */
@Component
@Slf4j
public class AiClient {

    // The free Render instance sleeps when idle and can take about a minute to wake up.
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(10);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(100);
    // ~70 s in total: long enough for a sleeping free instance to start after being woken.
    private static final List<Duration> WAKE_RETRY_DELAYS = List.of(
            Duration.ofSeconds(3), Duration.ofSeconds(5), Duration.ofSeconds(8),
            Duration.ofSeconds(12), Duration.ofSeconds(18), Duration.ofSeconds(24));
    private static final int LOGGED_BODY_CHARS = 200;

    private final AiProperties properties;
    private final RestClient restClient;

    public AiClient(AiProperties properties) {
        this.properties = properties;
        String baseUrl = normalizeBaseUrl(properties.serviceUrl());

        // HTTP/1.1 on purpose: the JDK client otherwise tries an HTTP/2 upgrade, which proxies
        // such as Render's edge can answer with a 502 page even though the service is healthy.
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(CONNECT_TIMEOUT)
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(READ_TIMEOUT);
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .defaultHeader(ServiceTokenFilter.HEADER, properties.hasServiceToken() ? properties.serviceToken() : "")
                .build();

        // Not secret, and the first thing to check when the AI "doesn't work".
        log.info("AI service: url={} tokenConfigured={}", baseUrl, properties.hasServiceToken());
        if (baseUrl.startsWith("http://") && baseUrl.contains(".onrender.com")) {
            log.warn("AI_SERVICE_URL uses http:// for a Render service; use https://");
        }
    }

    static String normalizeBaseUrl(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:8000";
        }
        String trimmed = url.strip();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }

    public boolean isConfigured() {
        return properties.hasServiceToken() && properties.serviceUrl() != null && !properties.serviceUrl().isBlank();
    }

    public String getOverview(Long productId) {
        return call(() -> restClient.get().uri("/products/{id}/overview", productId)
                .retrieve().body(String.class));
    }

    public String getReviewSummary(Long productId) {
        return call(() -> restClient.get().uri("/products/{id}/review-summary", productId)
                .retrieve().body(String.class));
    }

    public String ask(Long productId, String question) {
        return call(() -> restClient.post().uri("/products/{id}/ask", productId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("question", question))
                .retrieve().body(String.class));
    }

    /**
     * Start a chat turn. Returns the AI service's Server-Sent Events stream, open: the caller
     * copies it to the browser and must close it. Errors before the stream starts (asleep,
     * busy, invalid message) are thrown like for the other calls.
     */
    public InputStream openChat(Map<String, Object> payload) {
        return call(() -> restClient.post().uri("/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .body(payload)
                .exchange((request, response) -> {
                    if (response.getStatusCode().is2xxSuccessful()) {
                        return response.getBody();
                    }
                    byte[] body;
                    try (response) {
                        body = response.getBody().readAllBytes();
                    }
                    throw errorFor(response.getStatusCode(), body);
                }, false));
    }

    public void chatFeedback(Map<String, Object> payload) {
        call(() -> restClient.post().uri("/chat/feedback")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve().toBodilessEntity());
    }

    private static RestClientResponseException errorFor(HttpStatusCode status, byte[] body) {
        HttpStatus known = HttpStatus.resolve(status.value());
        String text = known != null ? known.getReasonPhrase() : "";
        return status.is4xxClientError()
                ? HttpClientErrorException.create(status, text, HttpHeaders.EMPTY, body, StandardCharsets.UTF_8)
                : HttpServerErrorException.create(status, text, HttpHeaders.EMPTY, body, StandardCharsets.UTF_8);
    }

    /** Ask the AI service to re-index the product (it deletes the data if the product is gone). */
    public void requestReindex(Long productId) {
        call(() -> restClient.post().uri("/index/products/{id}", productId)
                .retrieve().toBodilessEntity());
    }

    private <T> T call(Supplier<T> request) {
        if (!isConfigured()) {
            throw new AiServiceException(HttpStatus.SERVICE_UNAVAILABLE, "The AI assistant isn't configured");
        }
        try {
            return callWithRetry(request);
        } catch (RestClientResponseException e) {
            HttpStatusCode code = e.getStatusCode();
            if (code.value() == 404) {
                throw new AiServiceException(HttpStatus.NOT_FOUND, "Product not found", e);
            }
            if (code.value() == 422) {
                throw new AiServiceException(HttpStatus.BAD_REQUEST, "Invalid request", e);
            }
            log.warn("AI service answered {}: {}", code.value(), shorten(e.getResponseBodyAsString()));
            HttpStatus status = code.value() == 503 ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.BAD_GATEWAY;
            throw new AiServiceException(status, "The AI assistant is unavailable right now", e);
        } catch (ResourceAccessException e) {
            log.warn("AI service unreachable: {}", e.getMessage());
            throw new AiServiceException(HttpStatus.SERVICE_UNAVAILABLE, "The AI assistant is waking up, try again in a minute", e);
        }
    }

    /**
     * Render answers 502 while the free AI instance is asleep, and it doesn't wake it up for calls
     * coming from another Render service. The storefront pings the AI service directly
     * (AiService.wake in the client), which takes ~30-60 s; keep retrying for that long.
     */
    private static <T> T callWithRetry(Supplier<T> request) {
        for (int attempt = 0; ; attempt++) {
            try {
                return request.get();
            } catch (RestClientResponseException e) {
                if (e.getStatusCode().value() != 502 || attempt >= WAKE_RETRY_DELAYS.size()) {
                    throw e;
                }
                Duration delay = WAKE_RETRY_DELAYS.get(attempt);
                log.info("AI service answered 502 (probably asleep), retry {}/{} in {}s",
                        attempt + 1, WAKE_RETRY_DELAYS.size(), delay.toSeconds());
                try {
                    Thread.sleep(delay.toMillis());
                } catch (InterruptedException interrupted) {
                    Thread.currentThread().interrupt();
                    throw e;
                }
            }
        }
    }

    /** Error bodies can be whole HTML pages; keep logs readable. */
    static String shorten(String body) {
        if (body == null) {
            return "";
        }
        String oneLine = body.replaceAll("\\s+", " ").strip();
        return oneLine.length() <= LOGGED_BODY_CHARS ? oneLine : oneLine.substring(0, LOGGED_BODY_CHARS) + "…";
    }
}

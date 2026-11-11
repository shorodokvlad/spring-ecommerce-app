package com.shv.Ecommerce.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;

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

    private final AiProperties properties;
    private final RestClient restClient;

    public AiClient(AiProperties properties) {
        this.properties = properties;
        HttpClient httpClient = HttpClient.newBuilder().connectTimeout(CONNECT_TIMEOUT).build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(READ_TIMEOUT);
        this.restClient = RestClient.builder()
                .baseUrl(properties.serviceUrl() == null ? "http://localhost:8000" : properties.serviceUrl())
                .requestFactory(requestFactory)
                .defaultHeader(ServiceTokenFilter.HEADER, properties.hasServiceToken() ? properties.serviceToken() : "")
                .build();
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

    /** Ask the AI service to re-index the product (it deletes the data if the product is gone). */
    public void requestReindex(Long productId) {
        call(() -> restClient.post().uri("/index/products/{id}", productId)
                .retrieve().toBodilessEntity());
    }

    private <T> T call(java.util.function.Supplier<T> request) {
        if (!isConfigured()) {
            throw new AiServiceException(HttpStatus.SERVICE_UNAVAILABLE, "The AI assistant isn't configured");
        }
        try {
            return request.get();
        } catch (RestClientResponseException e) {
            HttpStatusCode code = e.getStatusCode();
            if (code.value() == 404) {
                throw new AiServiceException(HttpStatus.NOT_FOUND, "Product not found", e);
            }
            if (code.value() == 422) {
                throw new AiServiceException(HttpStatus.BAD_REQUEST, "Invalid question", e);
            }
            log.warn("AI service answered {}: {}", code.value(), e.getResponseBodyAsString());
            HttpStatus status = code.value() == 503 ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.BAD_GATEWAY;
            throw new AiServiceException(status, "The AI assistant is unavailable right now", e);
        } catch (ResourceAccessException e) {
            log.warn("AI service unreachable: {}", e.getMessage());
            throw new AiServiceException(HttpStatus.SERVICE_UNAVAILABLE, "The AI assistant is waking up, try again in a minute", e);
        }
    }
}

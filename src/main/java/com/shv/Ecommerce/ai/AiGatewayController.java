package com.shv.Ecommerce.ai;

import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.security.AuthUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Public AI endpoints for the storefront. The browser only ever talks to Spring; Spring
 * calls the AI service with the service token. Guests may use these (rate-limited).
 */
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiGatewayController {

    static final int MIN_QUESTION_LENGTH = 3;
    static final int MAX_QUESTION_LENGTH = 300;
    static final int MAX_CHAT_MESSAGE_LENGTH = 1000;
    private static final int STREAM_BUFFER_BYTES = 1024;

    private final AiContentService aiContentService;
    private final AiClient aiClient;
    private final AiRateLimiter rateLimiter;

    public record AskRequest(String question) {
    }

    /** sessionId: from the previous "session" event (null starts a new chat); productId: page context. */
    public record ChatRequest(String message, String sessionId, Long productId) {
    }

    public record FeedbackRequest(String sessionId, Long messageId, Integer rating) {
    }

    @GetMapping(value = "/products/{productId}/overview", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> overview(@PathVariable Long productId) {
        return ResponseEntity.ok(aiContentService.overview(productId));
    }

    @GetMapping(value = "/products/{productId}/review-summary", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> reviewSummary(@PathVariable Long productId) {
        return ResponseEntity.ok(aiContentService.reviewSummary(productId));
    }

    @PostMapping(value = "/products/{productId}/ask", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> ask(
            @PathVariable Long productId,
            @RequestBody AskRequest body,
            @AuthenticationPrincipal AuthUser authUser,
            HttpServletRequest request) {
        String question = body == null || body.question() == null ? "" : body.question().strip();
        if (question.length() < MIN_QUESTION_LENGTH || question.length() > MAX_QUESTION_LENGTH) {
            return error(HttpStatus.BAD_REQUEST,
                    "Questions must be between " + MIN_QUESTION_LENGTH + " and " + MAX_QUESTION_LENGTH + " characters");
        }
        Long userId = authUser != null ? authUser.getUser().getId() : null;
        if (!rateLimiter.tryAcquire("ask", userId, clientIp(request))) {
            return error(HttpStatus.TOO_MANY_REQUESTS, "You've asked a lot of questions. Please try again in a few minutes.");
        }
        return ResponseEntity.ok(aiClient.ask(productId, question));
    }

    /**
     * Chat with the assistant. Streams the AI service's Server-Sent Events straight through
     * (session, token, tool, products, comparison, action, sources, done, error). The user id
     * comes from the JWT here, never from the browser.
     */
    @PostMapping("/chat")
    public ResponseEntity<StreamingResponseBody> chat(
            @RequestBody ChatRequest body,
            @AuthenticationPrincipal AuthUser authUser,
            HttpServletRequest request) {
        String message = body == null || body.message() == null ? "" : body.message().strip();
        // Errors are thrown, not returned: the declared body type must stay StreamingResponseBody,
        // or Spring won't stream it (and fails the request instead). handleAiError makes them JSON.
        if (message.isEmpty() || message.length() > MAX_CHAT_MESSAGE_LENGTH) {
            throw new AiServiceException(HttpStatus.BAD_REQUEST,
                    "Messages must be between 1 and " + MAX_CHAT_MESSAGE_LENGTH + " characters");
        }
        Long userId = authUser != null ? authUser.getUser().getId() : null;
        if (!rateLimiter.tryAcquire("chat", userId, clientIp(request))) {
            throw new AiServiceException(HttpStatus.TOO_MANY_REQUESTS,
                    "You've sent a lot of messages. Please try again in a few minutes.");
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("message", message);
        payload.put("session_id", parseSessionId(body.sessionId()));
        payload.put("user_id", userId);
        Long productId = body.productId() != null && body.productId() > 0 ? body.productId() : null;
        payload.put("page", Collections.singletonMap("product_id", productId));

        // Opened before answering, so "asleep" or "busy" still becomes a normal JSON error.
        InputStream upstream = aiClient.openChat(payload);
        StreamingResponseBody stream = out -> {
            try (upstream) {
                byte[] buffer = new byte[STREAM_BUFFER_BYTES];
                int read;
                while ((read = upstream.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                    out.flush(); // every token reaches the browser right away
                }
            }
        };
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                .header("X-Accel-Buffering", "no")
                .body(stream);
    }

    /** Thumbs up (1) or down (-1) on one assistant answer. */
    @PostMapping("/chat/feedback")
    public ResponseEntity<?> chatFeedback(@RequestBody FeedbackRequest body) {
        String sessionId = body == null ? null : parseSessionId(body.sessionId());
        if (sessionId == null || body.messageId() == null || body.messageId() < 1
                || body.rating() == null || Math.abs(body.rating()) != 1) {
            return error(HttpStatus.BAD_REQUEST, "Invalid feedback");
        }
        try {
            aiClient.chatFeedback(Map.of("session_id", sessionId, "message_id", body.messageId(), "rating", body.rating()));
        } catch (AiServiceException e) {
            if (e.getStatus() == HttpStatus.NOT_FOUND) {
                return error(HttpStatus.NOT_FOUND, "That answer can't be rated");
            }
            throw e;
        }
        return ResponseEntity.noContent().build();
    }

    /** A well-formed session id, or null (a new chat). */
    static String parseSessionId(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return UUID.fromString(value.strip()).toString();
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @ExceptionHandler(AiServiceException.class)
    public ResponseEntity<Response> handleAiError(AiServiceException e) {
        return error(e.getStatus(), e.getMessage());
    }

    private static ResponseEntity<Response> error(HttpStatus status, String message) {
        return ResponseEntity.status(status)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Response.builder().status(status.value()).message(message).build());
    }

    /**
     * Client IP for guest rate limiting. Behind Render's proxy the real address is the last
     * entry the proxy appended to X-Forwarded-For; earlier entries can be forged by the client.
     */
    static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            String[] parts = forwarded.split(",");
            return parts[parts.length - 1].trim();
        }
        return request.getRemoteAddr();
    }
}

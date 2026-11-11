package com.shv.Ecommerce.ai;

import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.security.AuthUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
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

    private final AiContentService aiContentService;
    private final AiClient aiClient;
    private final AiRateLimiter rateLimiter;

    public record AskRequest(String question) {
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

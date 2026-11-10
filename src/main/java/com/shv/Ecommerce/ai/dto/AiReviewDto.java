package com.shv.Ecommerce.ai.dto;

import java.time.LocalDateTime;

/** Review for the AI service. No user name, email or id: reviews are indexed without PII. */
public record AiReviewDto(
        Long id,
        Long productId,
        int rating,
        String content,
        LocalDateTime createdAt
) {
}

package com.shv.Ecommerce.ai;

/**
 * A product or one of its reviews was created, updated or deleted. Handled after the
 * transaction commits by {@link AiIndexNotifier}.
 */
public record AiProductChangedEvent(Long productId) {
}

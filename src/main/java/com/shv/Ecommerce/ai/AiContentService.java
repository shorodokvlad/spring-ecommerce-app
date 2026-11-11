package com.shv.Ecommerce.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * Cached product-page AI content. Entries are evicted by {@link AiIndexNotifier} when the
 * product or its reviews change, so the TTL (CacheConfig) is just a safety net.
 * Errors are thrown, never cached.
 */
@Service
@RequiredArgsConstructor
public class AiContentService {

    public static final String OVERVIEW_CACHE = "aiOverview";
    public static final String REVIEW_SUMMARY_CACHE = "aiReviewSummary";

    private final AiClient aiClient;

    @Cacheable(cacheNames = OVERVIEW_CACHE, key = "#productId")
    public String overview(Long productId) {
        return aiClient.getOverview(productId);
    }

    @Cacheable(cacheNames = REVIEW_SUMMARY_CACHE, key = "#productId")
    public String reviewSummary(Long productId) {
        return aiClient.getReviewSummary(productId);
    }
}

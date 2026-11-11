package com.shv.Ecommerce.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * After a product or review change is committed: drop the cached AI content for that product
 * and ask the AI service to re-index it. Runs async, so a sleeping AI service never slows
 * down an admin save; failures are only logged (the nightly reconcile catches up).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AiIndexNotifier {

    private final AiClient aiClient;
    private final CacheManager cacheManager;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onProductChanged(AiProductChangedEvent event) {
        Long productId = event.productId();
        if (productId == null) {
            return;
        }
        evict(AiContentService.OVERVIEW_CACHE, productId);
        evict(AiContentService.REVIEW_SUMMARY_CACHE, productId);

        if (!aiClient.isConfigured()) {
            return;
        }
        try {
            aiClient.requestReindex(productId);
        } catch (AiServiceException e) {
            log.warn("Couldn't notify the AI service about product {}: {}", productId, e.getMessage());
        }
    }

    private void evict(String cacheName, Long productId) {
        try {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.evict(productId);
            }
        } catch (RuntimeException e) {
            log.warn("Couldn't evict {} for product {}: {}", cacheName, productId, e.getMessage());
        }
    }
}

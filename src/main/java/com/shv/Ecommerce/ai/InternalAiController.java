package com.shv.Ecommerce.ai;

import com.shv.Ecommerce.ai.dto.AiPage;
import com.shv.Ecommerce.ai.dto.AiProductDto;
import com.shv.Ecommerce.ai.dto.AiReviewDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Endpoints used only by the Python AI service. Protected by {@link ServiceTokenFilter};
 * user JWTs are never accepted here (see SecurityConfig).
 */
@RestController
@RequestMapping("/internal/ai")
@RequiredArgsConstructor
public class InternalAiController {

    private static final int MAX_IDS = 100;

    private final AiCatalogService aiCatalogService;

    /** Paged catalog in id order, used by the backfill / reconcile job. */
    @GetMapping("/products")
    public ResponseEntity<AiPage<AiProductDto>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(aiCatalogService.getProducts(page, size));
    }

    /** Live data for a set of products (hydrating search results). Unknown ids are skipped. */
    @GetMapping("/products/by-ids")
    public ResponseEntity<List<AiProductDto>> getProductsByIds(@RequestParam List<Long> ids) {
        if (ids.size() > MAX_IDS) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(aiCatalogService.getProductsByIds(ids));
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<AiProductDto> getProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(aiCatalogService.getProduct(productId));
    }

    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<List<AiReviewDto>> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(aiCatalogService.getReviews(productId));
    }
}

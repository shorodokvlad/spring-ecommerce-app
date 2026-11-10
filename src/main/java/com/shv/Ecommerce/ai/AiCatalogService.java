package com.shv.Ecommerce.ai;

import com.shv.Ecommerce.ai.dto.AiPage;
import com.shv.Ecommerce.ai.dto.AiProductDto;
import com.shv.Ecommerce.ai.dto.AiReviewDto;
import com.shv.Ecommerce.ai.dto.AiVariantDto;
import com.shv.Ecommerce.entity.Product;
import com.shv.Ecommerce.entity.ProductVariant;
import com.shv.Ecommerce.entity.Review;
import com.shv.Ecommerce.exception.NotFoundException;
import com.shv.Ecommerce.repository.ProductRepo;
import com.shv.Ecommerce.repository.ReviewRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Read-only catalog view for the AI service. Not cached: the indexer must see fresh data. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiCatalogService {

    public static final int MAX_PAGE_SIZE = 200;

    private final ProductRepo productRepo;
    private final ReviewRepo reviewRepo;

    public AiPage<AiProductDto> getProducts(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, MAX_PAGE_SIZE));
        Page<Product> productPage = productRepo.findAll(
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.ASC, "id")));

        Map<Long, ReviewStats> stats = loadReviewStats();
        List<AiProductDto> items = productPage.getContent().stream()
                .map(product -> toDto(product, stats))
                .toList();

        return new AiPage<>(items, safePage, safeSize, productPage.getTotalPages(), productPage.getTotalElements());
    }

    public List<AiProductDto> getProductsByIds(Collection<Long> ids) {
        if (ids.isEmpty()) {
            return List.of();
        }
        Map<Long, ReviewStats> stats = loadReviewStats();
        return productRepo.findAllById(ids).stream()
                .sorted(Comparator.comparing(Product::getId))
                .map(product -> toDto(product, stats))
                .toList();
    }

    public AiProductDto getProduct(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        return toDto(product, loadReviewStats());
    }

    public List<AiReviewDto> getReviews(Long productId) {
        if (!productRepo.existsById(productId)) {
            throw new NotFoundException("Product not found");
        }
        return reviewRepo.findByProductId(productId).stream()
                .sorted(Comparator.comparing(Review::getCreatedAt).reversed())
                .map(review -> new AiReviewDto(
                        review.getId(),
                        productId,
                        review.getRating(),
                        review.getContent(),
                        review.getCreatedAt()))
                .toList();
    }

    private AiProductDto toDto(Product product, Map<Long, ReviewStats> stats) {
        ReviewStats reviewStats = stats.getOrDefault(product.getId(), ReviewStats.EMPTY);
        List<AiVariantDto> variants = product.getVariants() == null ? List.of() : product.getVariants().stream()
                .map(AiCatalogService::toVariantDto)
                .toList();

        return new AiProductDto(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getPrice(),
                product.getStockQuantity(),
                product.getImageUrl(),
                reviewStats.averageRating(),
                reviewStats.count(),
                variants);
    }

    private static AiVariantDto toVariantDto(ProductVariant variant) {
        return new AiVariantDto(
                variant.getId(),
                variant.getTitle(),
                variant.getAttributes() == null ? Map.of() : new HashMap<>(variant.getAttributes()),
                variant.getPrice(),
                variant.getStockQuantity());
    }

    /** One grouped query for all products; the catalog is small enough that this beats per-product lookups. */
    private Map<Long, ReviewStats> loadReviewStats() {
        Map<Long, ReviewStats> stats = new HashMap<>();
        for (Object[] row : reviewRepo.findAverageRatingByProduct()) {
            Long productId = ((Number) row[0]).longValue();
            BigDecimal average = BigDecimal.valueOf(((Number) row[1]).doubleValue()).setScale(1, RoundingMode.HALF_UP);
            int count = ((Number) row[2]).intValue();
            stats.put(productId, new ReviewStats(average, count));
        }
        return stats;
    }

    private record ReviewStats(BigDecimal averageRating, int count) {
        static final ReviewStats EMPTY = new ReviewStats(null, 0);
    }
}

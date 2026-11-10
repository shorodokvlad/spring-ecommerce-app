package com.shv.Ecommerce.ai.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Product as seen by the AI indexer. {@code description} is passed through raw:
 * it may hold the spec JSON (see client/src/utils/specParser.js), which the AI
 * service parses itself. Cost price and supplier data are deliberately left out.
 */
public record AiProductDto(
        Long id,
        String name,
        String description,
        Long categoryId,
        String categoryName,
        BigDecimal price,
        Integer stockQuantity,
        String imageUrl,
        BigDecimal averageRating,
        int reviewCount,
        List<AiVariantDto> variants
) {
}

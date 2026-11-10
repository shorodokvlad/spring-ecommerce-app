package com.shv.Ecommerce.ai.dto;

import java.math.BigDecimal;
import java.util.Map;

public record AiVariantDto(
        Long id,
        String title,
        Map<String, String> attributes,
        BigDecimal price,
        Integer stockQuantity
) {
}

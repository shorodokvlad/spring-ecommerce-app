package com.shv.Ecommerce.ai.dto;

import java.util.List;

public record AiPage<T>(
        List<T> items,
        int page,
        int size,
        int totalPages,
        long totalElements
) {
}

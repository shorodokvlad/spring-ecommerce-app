package com.shv.Ecommerce.dto;

import lombok.Data;

@Data
public class OrderItemRequest {
    private Long productId;
    private Long variantId;
    private int quantity;
}

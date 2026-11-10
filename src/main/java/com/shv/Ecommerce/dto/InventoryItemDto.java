package com.shv.Ecommerce.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@AllArgsConstructor
@NoArgsConstructor
public class InventoryItemDto {
    private Long productId;
    private String productName;
    private String categoryName;
    private String sku;
    private Integer incomingQuantity;
    private Integer availableStock;
    private String status; // In stock, Low stock, Out of stock
    private BigDecimal price;
    private BigDecimal costPrice;
    private String imageUrl;
    private java.util.List<ProductVariantDto> variants;
}

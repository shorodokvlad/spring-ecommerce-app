package com.shv.Ecommerce.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@AllArgsConstructor
@NoArgsConstructor
public class WarehouseStockDto {
    private Long id;
    private Long warehouseId;
    private String warehouseName;
    private Long variantId;
    private String variantTitle;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private Integer quantity;
}
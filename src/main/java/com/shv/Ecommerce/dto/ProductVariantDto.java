package com.shv.Ecommerce.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariantDto {
    private Long id;
    private String title;
    private Map<String, String> attributes;
    private BigDecimal price;
    private Integer stockQuantity;
    private List<String> imageUrls;
    private List<WarehouseStockDto> stockByWarehouse;
}

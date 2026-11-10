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
public class InventorySummaryDto {
    private BigDecimal totalAssetValue;
    private Integer totalProducts;
    private Integer inStockCount;
    private Integer lowStockCount;
    private Integer outOfStockCount;
    private Integer totalIncomingUnits;
}

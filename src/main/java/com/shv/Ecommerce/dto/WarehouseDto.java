package com.shv.Ecommerce.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@AllArgsConstructor
@NoArgsConstructor
public class WarehouseDto {
    private Long id;
    private String name;
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private Integer totalStockQuantity;
    private List<WarehouseStockDto> warehouseStocks;
}
package com.shv.Ecommerce.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DeliveryOptionDto {
    private String service;    // "standard" | "express"
    private String label;      // display name, e.g. "Standard Delivery"
    private LocalDate etaFrom;
    private LocalDate etaTo;
    private BigDecimal price;
    private boolean free;
}

package com.shv.Ecommerce.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DeliveryEstimateDto {
    private String source;          // "detected" | "manual"
    private String country;
    private String county;
    private String locality;
    private boolean localityResolved;
    private BigDecimal subtotal;
    private BigDecimal freeThreshold;
    private List<DeliveryOptionDto> options;
    private List<PickupPointDto> pickupPoints;
}

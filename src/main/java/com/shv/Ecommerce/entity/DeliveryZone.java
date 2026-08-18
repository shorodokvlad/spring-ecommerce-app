package com.shv.Ecommerce.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "delivery_zones", indexes = {
        @Index(name = "idx_delivery_zone_country_county", columnList = "country,county")
})
public class DeliveryZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String country;            // ISO 2-letter code, e.g. "RO" or "DE"
    private String county;             // null for country-wide rows (EU countries / RO fallback)

    private Integer transitDaysStandard;
    private Integer transitDaysExpress;

    private BigDecimal price;          // standard delivery fee below the free threshold
    private BigDecimal expressPrice;   // express delivery fee

    private BigDecimal freeThreshold;  // order subtotal >= threshold => standard delivery is free
}

package com.shv.Ecommerce.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Entity
@Table(name = "product_variants", indexes = {
        @Index(name = "idx_variant_product", columnList = "product_id")
})
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title; // Custom Configuration Name/Title e.g. "Desert Titanium / 256GB"

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "variant_attributes", joinColumns = @JoinColumn(name = "variant_id"))
    @MapKeyColumn(name = "attribute_name")
    @Column(name = "attribute_value")
    private Map<String, String> attributes = new HashMap<>(); // Custom dynamic attributes e.g. {"Color": "Desert Titanium", "Case": "44mm"}

    private BigDecimal price;
    private Integer stockQuantity;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_variant_images", joinColumns = @JoinColumn(name = "variant_id"))
    @Column(name = "image_url")
    private List<String> imageUrls = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;
}

package com.shv.Ecommerce.entity;

import com.shv.Ecommerce.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // create


    private int quantity;
    private BigDecimal price;
    private OrderStatus status;

    @Column(name = "variant_id")
    private Long variantId;

    @Column(name = "variant_title")
    private String variantTitle;

    @Column(name = "variant_image_url", columnDefinition = "TEXT")
    private String variantImageUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "order_item_variant_attributes", joinColumns = @JoinColumn(name = "order_item_id"))
    @MapKeyColumn(name = "attribute_name")
    @Column(name = "attribute_value")
    private Map<String, String> variantAttributes = new HashMap<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "created_at")
    private final LocalDateTime createdAt = LocalDateTime.now();
}

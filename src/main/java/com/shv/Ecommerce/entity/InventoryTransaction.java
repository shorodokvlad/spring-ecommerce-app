package com.shv.Ecommerce.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "inventory_transactions")
public class InventoryTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Column(nullable = false)
    private String type; // PURCHASE_RECEIPT, CUSTOMER_SALE, CUSTOMER_RETURN, MANUAL_ADJUSTMENT

    @Column(name = "quantity_change", nullable = false)
    private Integer quantityChange;

    @Column(name = "unit_cost_price")
    private BigDecimal unitCostPrice;

    @Column(name = "reference_id")
    private String referenceId; // e.g. PO ID or Order ID

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}

package com.shv.Ecommerce.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "warehouse_stock", uniqueConstraints = {
        @UniqueConstraint(name = "uk_warehouse_variant", columnNames = {"warehouse_id", "variant_id"})
})
public class WarehouseStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id")
    @JsonIgnore
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "variant_id")
    @JsonIgnore
    private ProductVariant variant;

    private Integer quantity;
}
package com.shv.Ecommerce.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "localities", indexes = {
        @Index(name = "idx_locality_county", columnList = "county"),
        @Index(name = "idx_locality_search_name", columnList = "search_name")
})
public class Locality {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String county;
    private String name;

    private String searchName;

    private Integer population;
}
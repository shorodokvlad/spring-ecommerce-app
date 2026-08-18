package com.shv.Ecommerce.repository;

import com.shv.Ecommerce.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarehouseRepo extends JpaRepository<Warehouse, Long> {
}
package com.shv.Ecommerce.repository;

import com.shv.Ecommerce.entity.WarehouseStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WarehouseStockRepo extends JpaRepository<WarehouseStock, Long> {
    List<WarehouseStock> findByVariantId(Long variantId);

    List<WarehouseStock> findByWarehouseId(Long warehouseId);

    @Query("select coalesce(sum(ws.quantity), 0) from WarehouseStock ws where ws.warehouse.id = :warehouseId")
    Integer sumQuantityByWarehouseId(@Param("warehouseId") Long warehouseId);
}
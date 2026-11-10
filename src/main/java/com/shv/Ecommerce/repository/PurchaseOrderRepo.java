package com.shv.Ecommerce.repository;

import com.shv.Ecommerce.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepo extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByStatus(String status);

    @Query("SELECT poi.product.id, SUM(poi.orderedQuantity - poi.receivedQuantity) " +
           "FROM PurchaseOrderItem poi JOIN poi.purchaseOrder po " +
           "WHERE po.status IN ('ORDERED', 'PARTIALLY_RECEIVED') " +
           "GROUP BY poi.product.id")
    List<Object[]> findIncomingQuantityByProduct();

    @Query("SELECT SUM(poi.orderedQuantity - poi.receivedQuantity) " +
           "FROM PurchaseOrderItem poi JOIN poi.purchaseOrder po " +
           "WHERE po.status IN ('ORDERED', 'PARTIALLY_RECEIVED') " +
           "AND poi.product.id = :productId")
    Long findIncomingQuantityForProduct(@Param("productId") Long productId);
}

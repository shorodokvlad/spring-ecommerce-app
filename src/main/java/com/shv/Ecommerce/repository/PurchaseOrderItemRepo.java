package com.shv.Ecommerce.repository;

import com.shv.Ecommerce.entity.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface PurchaseOrderItemRepo extends JpaRepository<PurchaseOrderItem, Long> {
    List<PurchaseOrderItem> findByPurchaseOrderId(Long purchaseOrderId);

    /** Purchase orders keep their lines when variants are removed, without the variant link. */
    @Modifying(flushAutomatically = true)
    @Query("update PurchaseOrderItem i set i.variant = null where i.variant.id in :variantIds")
    int detachVariants(@Param("variantIds") Collection<Long> variantIds);

    /** Purchase orders keep their lines when a product is deleted. */
    @Modifying(flushAutomatically = true)
    @Query("update PurchaseOrderItem i set i.product = null, i.variant = null where i.product.id = :productId")
    int detachProduct(@Param("productId") Long productId);
}

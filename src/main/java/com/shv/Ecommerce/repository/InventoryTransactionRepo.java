package com.shv.Ecommerce.repository;

import com.shv.Ecommerce.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface InventoryTransactionRepo extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByProductId(Long productId);

    /** Keeps the stock history when variants are removed: the rows stay, without the variant link. */
    @Modifying(flushAutomatically = true)
    @Query("update InventoryTransaction t set t.variant = null where t.variant.id in :variantIds")
    int detachVariants(@Param("variantIds") Collection<Long> variantIds);

    /** Keeps the stock history when a product is deleted. */
    @Modifying(flushAutomatically = true)
    @Query("update InventoryTransaction t set t.product = null, t.variant = null where t.product.id = :productId")
    int detachProduct(@Param("productId") Long productId);
}

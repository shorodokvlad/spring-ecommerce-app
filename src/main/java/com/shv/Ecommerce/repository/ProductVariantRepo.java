package com.shv.Ecommerce.repository;

import com.shv.Ecommerce.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductVariantRepo extends JpaRepository<ProductVariant, Long> {
    Optional<ProductVariant> findByIdAndProductId(Long id, Long productId);
}

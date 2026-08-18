package com.shv.Ecommerce.repository;

import com.shv.Ecommerce.entity.DeliveryZone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryZoneRepo extends JpaRepository<DeliveryZone, Long> {

    Optional<DeliveryZone> findByCountryIgnoreCase(String country);

    Optional<DeliveryZone> findByCountryIgnoreCaseAndCountyIgnoreCase(String country, String county);

    boolean existsByCountryIgnoreCaseAndCountyIgnoreCase(String country, String county);
}

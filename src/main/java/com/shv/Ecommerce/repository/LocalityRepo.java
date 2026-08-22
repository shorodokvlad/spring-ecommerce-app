package com.shv.Ecommerce.repository;

import com.shv.Ecommerce.entity.Locality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface LocalityRepo extends JpaRepository<Locality, Long> {

    List<Locality> findByCountyIgnoreCaseOrderByNameAsc(String county);

    Optional<Locality> findTop1BySearchNameOrderByPopulationDesc(String searchName);

    @Query("select distinct l.county from Locality l order by l.county")
    List<String> findDistinctCounties();
}
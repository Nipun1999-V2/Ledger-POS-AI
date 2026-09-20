package com.posapp.repository;

import com.posapp.entity.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface RawMaterialRepository extends JpaRepository<RawMaterial, Long> {
    Optional<RawMaterial> findBySku(String sku);
    List<RawMaterial> findByActiveTrue();
    List<RawMaterial> findBySellableDirectlyTrueAndActiveTrue();

    // used by the stock monitor - anything at or below its minimum level
    @org.springframework.data.jpa.repository.Query(
        "select r from RawMaterial r where r.active = true and r.currentStock <= r.minStockLevel")
    List<RawMaterial> findLowStock();
}

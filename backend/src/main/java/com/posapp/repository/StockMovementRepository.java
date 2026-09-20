package com.posapp.repository;

import com.posapp.entity.StockMovement;
import com.posapp.enums.CatalogType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByItemTypeAndItemIdOrderByCreatedAtDesc(CatalogType itemType, Long itemId);
}

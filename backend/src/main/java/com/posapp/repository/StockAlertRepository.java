package com.posapp.repository;

import com.posapp.entity.StockAlert;
import com.posapp.enums.AlertStatus;
import com.posapp.enums.CatalogType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockAlertRepository extends JpaRepository<StockAlert, Long> {
    List<StockAlert> findByStatusOrderByCreatedAtDesc(AlertStatus status);
    Optional<StockAlert> findFirstByItemTypeAndItemIdAndStatus(CatalogType itemType, Long itemId, AlertStatus status);
}

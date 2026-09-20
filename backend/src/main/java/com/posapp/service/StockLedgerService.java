package com.posapp.service;

import com.posapp.entity.StockAlert;
import com.posapp.entity.StockMovement;
import com.posapp.enums.AlertStatus;
import com.posapp.enums.CatalogType;
import com.posapp.enums.MovementType;
import com.posapp.repository.StockAlertRepository;
import com.posapp.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Central place that records every stock change (sales, purchases, adjustments,
 * recipe consumption) as an immutable StockMovement row, and opens/resolves
 * StockAlert records whenever an item crosses its minimum stock threshold.
 * This is what "AI monitors all our stock" is built on: every movement is
 * captured here, which both the low-stock monitor and the forecasting
 * service read from.
 */
@Service
@RequiredArgsConstructor
public class StockLedgerService {

    private final StockMovementRepository stockMovementRepository;
    private final StockAlertRepository stockAlertRepository;

    public void recordMovement(CatalogType itemType, Long itemId, String itemName,
                                MovementType movementType, BigDecimal quantity,
                                BigDecimal balanceAfter, String reference, String note) {
        StockMovement movement = new StockMovement();
        movement.setItemType(itemType);
        movement.setItemId(itemId);
        movement.setItemName(itemName);
        movement.setMovementType(movementType);
        movement.setQuantity(quantity);
        movement.setBalanceAfter(balanceAfter);
        movement.setReference(reference);
        movement.setNote(note);
        stockMovementRepository.save(movement);

        checkAndUpdateAlert(itemType, itemId, itemName, balanceAfter, movementType);
    }

    private void checkAndUpdateAlert(CatalogType itemType, Long itemId, String itemName,
                                      BigDecimal currentStock, MovementType movementType) {
        // The scheduled StockAlertScheduler does a full threshold sweep on a cadence;
        // this hook additionally auto-resolves an alert the instant a restock clears it.
        if (movementType == MovementType.PURCHASE_IN || movementType == MovementType.RETURN_IN) {
            stockAlertRepository.findFirstByItemTypeAndItemIdAndStatus(itemType, itemId, AlertStatus.OPEN)
                    .ifPresent(alert -> {
                        if (currentStock.compareTo(alert.getMinStockLevel()) > 0) {
                            alert.setStatus(AlertStatus.RESOLVED);
                            alert.setResolvedAt(LocalDateTime.now());
                            stockAlertRepository.save(alert);
                        }
                    });
        }
    }

    public void openAlertIfNeeded(CatalogType itemType, Long itemId, String itemName,
                                   BigDecimal currentStock, BigDecimal minStockLevel) {
        boolean alreadyOpen = stockAlertRepository
                .findFirstByItemTypeAndItemIdAndStatus(itemType, itemId, AlertStatus.OPEN).isPresent();
        if (!alreadyOpen) {
            StockAlert alert = new StockAlert();
            alert.setItemType(itemType);
            alert.setItemId(itemId);
            alert.setItemName(itemName);
            alert.setCurrentStock(currentStock);
            alert.setMinStockLevel(minStockLevel);
            stockAlertRepository.save(alert);
        }
    }
}

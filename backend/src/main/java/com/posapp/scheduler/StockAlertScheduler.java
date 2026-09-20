package com.posapp.scheduler;

import com.posapp.entity.Product;
import com.posapp.entity.RawMaterial;
import com.posapp.enums.CatalogType;
import com.posapp.repository.ProductRepository;
import com.posapp.repository.RawMaterialRepository;
import com.posapp.service.StockLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Periodic full sweep of stock levels, in addition to the real-time checks
 * that already run on every sale/adjustment. This is what "AI monitors all
 * our stock" means in practice: it re-checks everything on a cadence so
 * nothing is missed even if stock was changed outside the normal flows
 * (e.g. a manual DB correction or a min-stock-level edit).
 */
@Component
@RequiredArgsConstructor
public class StockAlertScheduler {

    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final StockLedgerService stockLedgerService;

    @Scheduled(cron = "${app.stock.alert-check-cron}")
    public void sweepLowStock() {
        for (Product p : productRepository.findLowStock()) {
            stockLedgerService.openAlertIfNeeded(CatalogType.PRODUCT, p.getId(), p.getName(),
                    p.getCurrentStock(), p.getMinStockLevel());
        }
        for (RawMaterial rm : rawMaterialRepository.findLowStock()) {
            stockLedgerService.openAlertIfNeeded(CatalogType.RAW_MATERIAL, rm.getId(), rm.getName(),
                    rm.getCurrentStock(), rm.getMinStockLevel());
        }
    }
}

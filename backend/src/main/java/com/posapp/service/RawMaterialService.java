package com.posapp.service;

import com.posapp.dto.request.RawMaterialRequest;
import com.posapp.entity.Category;
import com.posapp.entity.RawMaterial;
import com.posapp.entity.Supplier;
import com.posapp.enums.CatalogType;
import com.posapp.enums.MovementType;
import com.posapp.repository.CategoryRepository;
import com.posapp.repository.RawMaterialRepository;
import com.posapp.repository.SupplierRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RawMaterialService {

    private final RawMaterialRepository rawMaterialRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final StockLedgerService stockLedgerService;

    public List<RawMaterial> findAll() {
        return rawMaterialRepository.findAll();
    }

    public RawMaterial findById(Long id) {
        return rawMaterialRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Raw material not found: " + id));
    }

    @Transactional
    public RawMaterial create(RawMaterialRequest req) {
        RawMaterial rm = new RawMaterial();
        applyRequest(rm, req);
        rm.setCreatedAt(LocalDateTime.now());
        rm.setUpdatedAt(LocalDateTime.now());
        RawMaterial saved = rawMaterialRepository.save(rm);

        if (saved.getCurrentStock().compareTo(BigDecimal.ZERO) > 0) {
            stockLedgerService.recordMovement(CatalogType.RAW_MATERIAL, saved.getId(), saved.getName(),
                    MovementType.PURCHASE_IN, saved.getCurrentStock(), saved.getCurrentStock(),
                    "INITIAL_STOCK", "Opening stock on creation");
        }
        return saved;
    }

    @Transactional
    public RawMaterial update(Long id, RawMaterialRequest req) {
        RawMaterial rm = findById(id);
        applyRequest(rm, req);
        rm.setUpdatedAt(LocalDateTime.now());
        return rawMaterialRepository.save(rm);
    }

    @Transactional
    public RawMaterial adjustStock(Long id, BigDecimal delta, String note, MovementType movementType) {
        RawMaterial rm = findById(id);
        BigDecimal newStock = rm.getCurrentStock().add(delta);
        if (newStock.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException("Resulting stock cannot be negative for " + rm.getName());
        }
        rm.setCurrentStock(newStock);
        rm.setUpdatedAt(LocalDateTime.now());
        rawMaterialRepository.save(rm);

        stockLedgerService.recordMovement(CatalogType.RAW_MATERIAL, rm.getId(), rm.getName(),
                movementType, delta, newStock, null, note);

        if (newStock.compareTo(rm.getMinStockLevel()) <= 0) {
            stockLedgerService.openAlertIfNeeded(CatalogType.RAW_MATERIAL, rm.getId(), rm.getName(),
                    newStock, rm.getMinStockLevel());
        }
        return rm;
    }

    public void deactivate(Long id) {
        RawMaterial rm = findById(id);
        rm.setActive(false);
        rawMaterialRepository.save(rm);
    }

    private void applyRequest(RawMaterial rm, RawMaterialRequest req) {
        rm.setSku(req.getSku());
        rm.setName(req.getName());
        rm.setUnit(req.getUnit());
        rm.setCostPrice(req.getCostPrice());
        rm.setSellingPrice(req.getSellingPrice());
        rm.setMinStockLevel(req.getMinStockLevel());
        rm.setReorderQuantity(req.getReorderQuantity());
        rm.setSellableDirectly(req.isSellableDirectly());
        if (req.getCurrentStock() != null && rm.getId() == null) {
            rm.setCurrentStock(req.getCurrentStock());
        }
        if (req.getCategoryId() != null) {
            Category category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found"));
            rm.setCategory(category);
        }
        if (req.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(req.getSupplierId())
                    .orElseThrow(() -> new EntityNotFoundException("Supplier not found"));
            rm.setSupplier(supplier);
        }
    }
}

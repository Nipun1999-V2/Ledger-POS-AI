package com.posapp.service;

import com.posapp.dto.request.SaleRequest;
import com.posapp.entity.*;
import com.posapp.enums.CatalogType;
import com.posapp.enums.MovementType;
import com.posapp.enums.SaleStatus;
import com.posapp.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

/**
 * The core POS checkout flow: validates stock availability, deducts stock
 * (raw material directly, or a product's stock plus every raw material in
 * its recipe/BOM), records every movement on the stock ledger, and persists
 * the sale + line items.
 */
@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final ProductRecipeItemRepository recipeItemRepository;
    private final UserRepository userRepository;
    private final StockLedgerService stockLedgerService;

    private static final AtomicLong INVOICE_SEQ = new AtomicLong(System.currentTimeMillis() % 100000);

    @Transactional
    public Sale checkout(SaleRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("A sale must contain at least one item");
        }

        Sale sale = new Sale();
        sale.setInvoiceNumber(generateInvoiceNumber());
        sale.setCustomerName(request.getCustomerName());
        sale.setCustomerPhone(request.getCustomerPhone());
        sale.setSaleDate(LocalDateTime.now());
        sale.setPaymentMethod(request.getPaymentMethod());
        sale.setStatus(SaleStatus.COMPLETED);
        sale.setDiscount(request.getDiscount() == null ? BigDecimal.ZERO : request.getDiscount());

        currentUsername().flatMap(userRepository::findByUsername).ifPresent(sale::setCashier);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (SaleRequest.SaleLineRequest line : request.getItems()) {
            CatalogType type = CatalogType.valueOf(line.getItemType());
            BigDecimal qty = line.getQuantity();
            if (qty == null || qty.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Quantity must be positive for item " + line.getItemId());
            }

            SaleItem saleItem = new SaleItem();
            saleItem.setSale(sale);
            saleItem.setItemType(type);
            saleItem.setItemId(line.getItemId());
            saleItem.setQuantity(qty);

            if (type == CatalogType.RAW_MATERIAL) {
                RawMaterial rm = rawMaterialRepository.findById(line.getItemId())
                        .orElseThrow(() -> new EntityNotFoundException("Raw material not found: " + line.getItemId()));
                if (!rm.isSellableDirectly()) {
                    throw new IllegalStateException(rm.getName() + " is not marked as sellable directly");
                }
                ensureAvailable(rm.getCurrentStock(), qty, rm.getName());
                BigDecimal unitPrice = rm.getSellingPrice() != null ? rm.getSellingPrice() : rm.getCostPrice();

                saleItem.setItemName(rm.getName());
                saleItem.setUnitPrice(unitPrice);
                saleItem.setLineTotal(unitPrice.multiply(qty).setScale(2, RoundingMode.HALF_UP));

                BigDecimal newStock = rm.getCurrentStock().subtract(qty);
                rm.setCurrentStock(newStock);
                rawMaterialRepository.save(rm);
                stockLedgerService.recordMovement(CatalogType.RAW_MATERIAL, rm.getId(), rm.getName(),
                        MovementType.SALE_OUT, qty.negate(), newStock, sale.getInvoiceNumber(), "Sold directly");
                if (newStock.compareTo(rm.getMinStockLevel()) <= 0) {
                    stockLedgerService.openAlertIfNeeded(CatalogType.RAW_MATERIAL, rm.getId(), rm.getName(),
                            newStock, rm.getMinStockLevel());
                }

            } else {
                Product product = productRepository.findById(line.getItemId())
                        .orElseThrow(() -> new EntityNotFoundException("Product not found: " + line.getItemId()));
                ensureAvailable(product.getCurrentStock(), qty, product.getName());

                saleItem.setItemName(product.getName());
                saleItem.setUnitPrice(product.getSellingPrice());
                saleItem.setLineTotal(product.getSellingPrice().multiply(qty).setScale(2, RoundingMode.HALF_UP));

                BigDecimal newStock = product.getCurrentStock().subtract(qty);
                product.setCurrentStock(newStock);
                productRepository.save(product);
                stockLedgerService.recordMovement(CatalogType.PRODUCT, product.getId(), product.getName(),
                        MovementType.SALE_OUT, qty.negate(), newStock, sale.getInvoiceNumber(), null);
                if (newStock.compareTo(product.getMinStockLevel()) <= 0) {
                    stockLedgerService.openAlertIfNeeded(CatalogType.PRODUCT, product.getId(), product.getName(),
                            newStock, product.getMinStockLevel());
                }

                if (product.isHasRecipe()) {
                    consumeRecipe(product, qty, sale.getInvoiceNumber());
                }
            }

            sale.getItems().add(saleItem);
            subtotal = subtotal.add(saleItem.getLineTotal());
        }

        BigDecimal afterDiscount = subtotal.subtract(sale.getDiscount());
        BigDecimal taxRate = request.getTaxRate() == null ? BigDecimal.ZERO : request.getTaxRate();
        BigDecimal tax = afterDiscount.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);

        sale.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        sale.setTax(tax);
        sale.setTotal(afterDiscount.add(tax).setScale(2, RoundingMode.HALF_UP));

        return saleRepository.save(sale);
    }

    private void consumeRecipe(Product product, BigDecimal unitsSold, String invoiceNumber) {
        List<ProductRecipeItem> recipe = recipeItemRepository.findByProductId(product.getId());
        for (ProductRecipeItem item : recipe) {
            RawMaterial rm = item.getRawMaterial();
            BigDecimal required = item.getQuantityRequired().multiply(unitsSold);
            ensureAvailable(rm.getCurrentStock(), required, rm.getName());
            BigDecimal newStock = rm.getCurrentStock().subtract(required);
            rm.setCurrentStock(newStock);
            rawMaterialRepository.save(rm);
            stockLedgerService.recordMovement(CatalogType.RAW_MATERIAL, rm.getId(), rm.getName(),
                    MovementType.RECIPE_CONSUMPTION, required.negate(), newStock, invoiceNumber,
                    "Consumed making " + product.getName());
            if (newStock.compareTo(rm.getMinStockLevel()) <= 0) {
                stockLedgerService.openAlertIfNeeded(CatalogType.RAW_MATERIAL, rm.getId(), rm.getName(),
                        newStock, rm.getMinStockLevel());
            }
        }
    }

    private void ensureAvailable(BigDecimal available, BigDecimal required, String itemName) {
        if (available.compareTo(required) < 0) {
            throw new IllegalStateException("Insufficient stock for " + itemName +
                    " (available: " + available + ", required: " + required + ")");
        }
    }

    private String generateInvoiceNumber() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "INV-" + datePart + "-" + INVOICE_SEQ.incrementAndGet();
    }

    private java.util.Optional<String> currentUsername() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            return java.util.Optional.empty();
        }
        return java.util.Optional.of(auth.getName());
    }

    public List<Sale> findByDateRange(LocalDateTime from, LocalDateTime to) {
        return saleRepository.findBySaleDateBetween(from, to);
    }

    public Sale findById(Long id) {
        return saleRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Sale not found: " + id));
    }
}

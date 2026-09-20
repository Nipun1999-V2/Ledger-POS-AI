package com.posapp.service;

import com.posapp.dto.request.ProductRequest;
import com.posapp.entity.Category;
import com.posapp.entity.Product;
import com.posapp.entity.ProductRecipeItem;
import com.posapp.entity.RawMaterial;
import com.posapp.enums.CatalogType;
import com.posapp.enums.MovementType;
import com.posapp.repository.CategoryRepository;
import com.posapp.repository.ProductRepository;
import com.posapp.repository.RawMaterialRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final StockLedgerService stockLedgerService;

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + id));
    }

    @Transactional
    public Product create(ProductRequest req) {
        Product p = new Product();
        applyRequest(p, req);
        p.setCreatedAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());
        Product saved = productRepository.save(p);

        if (saved.getCurrentStock().compareTo(BigDecimal.ZERO) > 0) {
            stockLedgerService.recordMovement(CatalogType.PRODUCT, saved.getId(), saved.getName(),
                    MovementType.PURCHASE_IN, saved.getCurrentStock(), saved.getCurrentStock(),
                    "INITIAL_STOCK", "Opening stock on creation");
        }
        return saved;
    }

    @Transactional
    public Product update(Long id, ProductRequest req) {
        Product p = findById(id);
        applyRequest(p, req);
        p.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(p);
    }

    @Transactional
    public Product adjustStock(Long id, BigDecimal delta, String note, MovementType movementType) {
        Product p = findById(id);
        BigDecimal newStock = p.getCurrentStock().add(delta);
        if (newStock.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException("Resulting stock cannot be negative for " + p.getName());
        }
        p.setCurrentStock(newStock);
        p.setUpdatedAt(LocalDateTime.now());
        productRepository.save(p);

        stockLedgerService.recordMovement(CatalogType.PRODUCT, p.getId(), p.getName(),
                movementType, delta, newStock, null, note);

        if (newStock.compareTo(p.getMinStockLevel()) <= 0) {
            stockLedgerService.openAlertIfNeeded(CatalogType.PRODUCT, p.getId(), p.getName(),
                    newStock, p.getMinStockLevel());
        }
        return p;
    }

    public void deactivate(Long id) {
        Product p = findById(id);
        p.setActive(false);
        productRepository.save(p);
    }

    private void applyRequest(Product p, ProductRequest req) {
        p.setSku(req.getSku());
        p.setName(req.getName());
        p.setUnit(req.getUnit() == null ? "PCS" : req.getUnit());
        p.setCostPrice(req.getCostPrice());
        p.setSellingPrice(req.getSellingPrice());
        p.setMinStockLevel(req.getMinStockLevel());
        p.setReorderQuantity(req.getReorderQuantity());
        p.setHasRecipe(req.isHasRecipe());
        if (req.getCurrentStock() != null && p.getId() == null) {
            p.setCurrentStock(req.getCurrentStock());
        }
        if (req.getCategoryId() != null) {
            Category category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found"));
            p.setCategory(category);
        }

        if (req.isHasRecipe() && req.getRecipeItems() != null) {
            p.getRecipeItems().clear();
            List<ProductRecipeItem> items = new ArrayList<>();
            for (ProductRequest.RecipeItemRequest ri : req.getRecipeItems()) {
                RawMaterial rm = rawMaterialRepository.findById(ri.getRawMaterialId())
                        .orElseThrow(() -> new EntityNotFoundException("Raw material not found: " + ri.getRawMaterialId()));
                ProductRecipeItem item = new ProductRecipeItem();
                item.setProduct(p);
                item.setRawMaterial(rm);
                item.setQuantityRequired(ri.getQuantityRequired());
                items.add(item);
            }
            p.getRecipeItems().addAll(items);
        }
    }
}

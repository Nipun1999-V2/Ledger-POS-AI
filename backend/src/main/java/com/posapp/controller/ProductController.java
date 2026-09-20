package com.posapp.controller;

import com.posapp.dto.request.ProductRequest;
import com.posapp.dto.request.StockAdjustmentRequest;
import com.posapp.entity.Product;
import com.posapp.enums.MovementType;
import com.posapp.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<Product> all() {
        return productService.findAll();
    }

    @GetMapping("/{id}")
    public Product get(@PathVariable Long id) {
        return productService.findById(id);
    }

    @PostMapping
    public Product create(@RequestBody ProductRequest request) {
        return productService.create(request);
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody ProductRequest request) {
        return productService.update(id, request);
    }

    @PostMapping("/{id}/restock")
    public Product restock(@PathVariable Long id, @RequestBody StockAdjustmentRequest request) {
        return productService.adjustStock(id, request.getQuantity().abs(), request.getNote(), MovementType.PURCHASE_IN);
    }

    @PostMapping("/{id}/adjust")
    public Product adjust(@PathVariable Long id, @RequestBody StockAdjustmentRequest request) {
        return productService.adjustStock(id, request.getQuantity(), request.getNote(), MovementType.ADJUSTMENT);
    }

    @DeleteMapping("/{id}")
    public void deactivate(@PathVariable Long id) {
        productService.deactivate(id);
    }
}

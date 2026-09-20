package com.posapp.repository;

import com.posapp.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);
    List<Product> findByActiveTrue();

    @Query(
        "select p from Product p where p.active = true and p.currentStock >= p.minStockLevel")
    List<Product> findLowStock();
}

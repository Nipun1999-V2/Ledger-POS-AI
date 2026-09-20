package com.posapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(nullable = false, length = 150)
    private String name;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, length = 20)
    private String unit = "PCS";

    @Column(name = "cost_price", nullable = false, precision = 14, scale = 2)
    private BigDecimal costPrice = BigDecimal.ZERO;

    @Column(name = "selling_price", nullable = false, precision = 14, scale = 2)
    private BigDecimal sellingPrice;

    @Column(name = "current_stock", nullable = false, precision = 14, scale = 3)
    private BigDecimal currentStock = BigDecimal.ZERO;

    @Column(name = "min_stock_level", nullable = false, precision = 14, scale = 3)
    private BigDecimal minStockLevel = BigDecimal.ZERO;

    @Column(name = "reorder_quantity", nullable = false, precision = 14, scale = 3)
    private BigDecimal reorderQuantity = BigDecimal.ZERO;

    @Column(name = "has_recipe", nullable = false)
    private boolean hasRecipe = false;

    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductRecipeItem> recipeItems = new ArrayList<>();
}

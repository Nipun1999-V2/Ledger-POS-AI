package com.posapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "raw_materials")
@Getter
@Setter
public class RawMaterial {
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

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(name = "cost_price", nullable = false, precision = 14, scale = 2)
    private BigDecimal costPrice = BigDecimal.ZERO;

    @Column(name = "selling_price", precision = 14, scale = 2)
    private BigDecimal sellingPrice;

    @Column(name = "current_stock", nullable = false, precision = 14, scale = 3)
    private BigDecimal currentStock = BigDecimal.ZERO;

    @Column(name = "min_stock_level", nullable = false, precision = 14, scale = 3)
    private BigDecimal minStockLevel = BigDecimal.ZERO;

    @Column(name = "reorder_quantity", nullable = false, precision = 14, scale = 3)
    private BigDecimal reorderQuantity = BigDecimal.ZERO;

    @Column(name = "sellable_directly", nullable = false)
    private boolean sellableDirectly = false;

    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}

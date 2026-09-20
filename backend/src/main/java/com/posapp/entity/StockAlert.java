package com.posapp.entity;

import com.posapp.enums.AlertStatus;
import com.posapp.enums.CatalogType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_alerts")
@Getter
@Setter
public class StockAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false, length = 20)
    private CatalogType itemType;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "item_name", nullable = false, length = 150)
    private String itemName;

    @Column(name = "current_stock", nullable = false, precision = 14, scale = 3)
    private BigDecimal currentStock;

    @Column(name = "min_stock_level", nullable = false, precision = 14, scale = 3)
    private BigDecimal minStockLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertStatus status = AlertStatus.OPEN;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}

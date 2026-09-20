package com.posapp.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RawMaterialRequest {
    private String sku;
    private String name;
    private Long categoryId;
    private Long supplierId;
    private String unit;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private BigDecimal currentStock;
    private BigDecimal minStockLevel;
    private BigDecimal reorderQuantity;
    private boolean sellableDirectly;
}

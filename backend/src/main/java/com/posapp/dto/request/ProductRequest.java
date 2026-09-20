package com.posapp.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    private String sku;
    private String name;
    private Long categoryId;
    private String unit;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private BigDecimal currentStock;
    private BigDecimal minStockLevel;
    private BigDecimal reorderQuantity;
    private boolean hasRecipe;
    private List<RecipeItemRequest> recipeItems;

    @Data
    public static class RecipeItemRequest {
        private Long rawMaterialId;
        private BigDecimal quantityRequired;
    }
}

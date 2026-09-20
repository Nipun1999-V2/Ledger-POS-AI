package com.posapp.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StockAdjustmentRequest {
    private String itemType;      // PRODUCT or RAW_MATERIAL
    private Long itemId;
    private BigDecimal quantity;  // positive = stock in (purchase/restock), negative = adjustment down
    private String note;
}

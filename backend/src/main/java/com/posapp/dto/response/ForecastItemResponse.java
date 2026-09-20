package com.posapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ForecastItemResponse {
    private String itemType;
    private Long itemId;
    private String itemName;
    private BigDecimal currentStock;
    private BigDecimal avgMonthlySales;
    private BigDecimal predictedNextMonthQty;
    private BigDecimal suggestedReorderQty;
    private String trend;          // RISING, STABLE, FALLING
    private String confidence;     // LOW, MEDIUM, HIGH (based on how much history we have)
}

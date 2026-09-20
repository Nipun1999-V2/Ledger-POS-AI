package com.posapp.dto.request;

import com.posapp.enums.PaymentMethod;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class SaleRequest {
    private String customerName;
    private String customerPhone;
    private BigDecimal discount = BigDecimal.ZERO;
    private BigDecimal taxRate = BigDecimal.ZERO;   // e.g. 0.08 for 8%
    private PaymentMethod paymentMethod;
    private List<SaleLineRequest> items;

    @Data
    public static class SaleLineRequest {
        private String itemType;   // PRODUCT or RAW_MATERIAL
        private Long itemId;
        private BigDecimal quantity;
    }
}

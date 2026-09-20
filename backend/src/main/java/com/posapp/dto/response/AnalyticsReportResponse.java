package com.posapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
public class AnalyticsReportResponse {
    private String periodType;       // DAILY, WEEKLY, MONTHLY
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private BigDecimal totalRevenue;
    private long totalOrders;
    private BigDecimal totalItemsSold;
    private BigDecimal averageOrderValue;
    private BigDecimal revenueChangePct;   // vs previous equivalent period
    private List<TopItem> topSellingItems;
    private List<TopItem> lowPerformingItems;
    private String narrative;              // AI-generated (LLM or rule-based) summary

    @Data
    @AllArgsConstructor
    public static class TopItem {
        private String itemName;
        private BigDecimal quantitySold;
        private BigDecimal revenue;
    }
}

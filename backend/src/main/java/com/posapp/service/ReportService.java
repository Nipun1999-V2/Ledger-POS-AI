package com.posapp.service;

import com.posapp.dto.response.AnalyticsReportResponse;
import com.posapp.entity.Sale;
import com.posapp.repository.SaleItemRepository;
import com.posapp.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * AI analyst reports: daily / weekly / monthly performance summaries with
 * top & low performing items and a plain-English narrative
 * (see NarrativeReportService).
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final NarrativeReportService narrativeReportService;

    public AnalyticsReportResponse generate(String periodType, LocalDate start, LocalDate end) {
        LocalDateTime from = start.atStartOfDay();
        LocalDateTime to = end.atTime(23, 59, 59);

        List<Sale> sales = saleRepository.findBySaleDateBetween(from, to).stream()
                .filter(s -> s.getStatus() == com.posapp.enums.SaleStatus.COMPLETED)
                .collect(Collectors.toList());

        BigDecimal totalRevenue = sales.stream().map(Sale::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        long totalOrders = sales.size();
        BigDecimal avgOrderValue = totalOrders == 0 ? BigDecimal.ZERO :
                totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP);

        var aggregates = saleItemRepository.aggregateByItem(from, to);
        BigDecimal totalItemsSold = aggregates.stream()
                .map(a -> a.getTotalQty() == null ? BigDecimal.ZERO : a.getTotalQty())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<AnalyticsReportResponse.TopItem> topItems = aggregates.stream()
                .sorted(Comparator.comparing(SaleItemRepository.ItemSalesAggregate::getTotalRevenue).reversed())
                .limit(5)
                .map(a -> new AnalyticsReportResponse.TopItem(a.getItemName(), a.getTotalQty(), a.getTotalRevenue()))
                .collect(Collectors.toList());

        List<AnalyticsReportResponse.TopItem> lowItems = aggregates.stream()
                .sorted(Comparator.comparing(SaleItemRepository.ItemSalesAggregate::getTotalRevenue))
                .limit(5)
                .map(a -> new AnalyticsReportResponse.TopItem(a.getItemName(), a.getTotalQty(), a.getTotalRevenue()))
                .collect(Collectors.toList());

        // previous equivalent period, for the trend comparison
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        LocalDate prevStart = start.minusDays(days);
        LocalDate prevEnd = start.minusDays(1);
        BigDecimal prevRevenue = saleRepository
                .findBySaleDateBetween(prevStart.atStartOfDay(), prevEnd.atTime(23, 59, 59)).stream()
                .filter(s -> s.getStatus() == com.posapp.enums.SaleStatus.COMPLETED)
                .map(Sale::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal changePct = BigDecimal.ZERO;
        if (prevRevenue.compareTo(BigDecimal.ZERO) > 0) {
            changePct = totalRevenue.subtract(prevRevenue)
                    .divide(prevRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
        }

        AnalyticsReportResponse response = new AnalyticsReportResponse(
                periodType, start, end, totalRevenue.setScale(2, RoundingMode.HALF_UP), totalOrders,
                totalItemsSold, avgOrderValue, changePct, topItems, lowItems, null
        );
        response.setNarrative(narrativeReportService.generate(response));
        return response;
    }

    public AnalyticsReportResponse today() {
        return generate("DAILY", LocalDate.now(), LocalDate.now());
    }

    public AnalyticsReportResponse thisWeek() {
        LocalDate now = LocalDate.now();
        LocalDate start = now.minusDays(now.getDayOfWeek().getValue() - 1);
        return generate("WEEKLY", start, now);
    }

    public AnalyticsReportResponse thisMonth() {
        LocalDate now = LocalDate.now();
        return generate("MONTHLY", now.withDayOfMonth(1), now);
    }
}

package com.posapp.service;

import com.posapp.dto.response.ForecastItemResponse;
import com.posapp.entity.Product;
import com.posapp.entity.RawMaterial;
import com.posapp.repository.ProductRepository;
import com.posapp.repository.RawMaterialRepository;
import com.posapp.repository.SaleItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

/**
 * "AI" demand forecasting.
 *
 * This is implemented as a transparent statistical model rather than a black-box
 * neural network, which keeps it fast, explainable and dependency-free:
 *   1. Pull each item's monthly units-sold for the last N months (configurable).
 *   2. Fit a simple linear regression (least squares) of quantity vs month index.
 *   3. Project the next month's value from that line; if there isn't enough
 *      history for a stable regression, fall back to a recency-weighted average.
 *   4. Compare the forecast against current stock (and a small safety buffer)
 *      to suggest how much to reorder.
 *
 * This is the same family of technique ("statistical / ML-based demand
 * forecasting") that most inventory & POS "AI" features are built on. It can be
 * swapped for a real ML model later without changing the API surface -
 * everything downstream only depends on ForecastItemResponse.
 */
@Service
@RequiredArgsConstructor
public class ForecastService {

    private final SaleItemRepository saleItemRepository;
    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;

    @Value("${app.ai.forecast-history-months:6}")
    private int historyMonths;

    @Value("${app.stock.default-safety-stock-days:7}")
    private int safetyStockDays;

    public List<ForecastItemResponse> predictAllItems() {
        Map<String, double[]> monthlySeries = buildMonthlySeries();
        Map<String, BigDecimal> currentStockByKey = new HashMap<>();
        Map<String, String> namesByKey = new HashMap<>();

        for (Product p : productRepository.findByActiveTrue()) {
            currentStockByKey.put("PRODUCT:" + p.getId(), p.getCurrentStock());
            namesByKey.put("PRODUCT:" + p.getId(), p.getName());
        }
        for (RawMaterial rm : rawMaterialRepository.findByActiveTrue()) {
            currentStockByKey.put("RAW_MATERIAL:" + rm.getId(), rm.getCurrentStock());
            namesByKey.put("RAW_MATERIAL:" + rm.getId(), rm.getName());
        }

        List<ForecastItemResponse> results = new ArrayList<>();
        for (Map.Entry<String, double[]> entry : monthlySeries.entrySet()) {
            String key = entry.getKey();
            double[] series = entry.getValue();
            String[] parts = key.split(":", 2);
            String itemType = parts[0];
            Long itemId = Long.parseLong(parts[1]);

            Forecast forecast = forecast(series);
            BigDecimal currentStock = currentStockByKey.getOrDefault(key, BigDecimal.ZERO);
            BigDecimal predictedQty = BigDecimal.valueOf(Math.max(0, forecast.predictedNext()))
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal avgMonthly = BigDecimal.valueOf(Arrays.stream(series).average().orElse(0))
                    .setScale(2, RoundingMode.HALF_UP);

            BigDecimal dailyRate = predictedQty.divide(BigDecimal.valueOf(30), 4, RoundingMode.HALF_UP);
            BigDecimal safetyStock = dailyRate.multiply(BigDecimal.valueOf(safetyStockDays));
            BigDecimal suggestedReorder = predictedQty.add(safetyStock).subtract(currentStock);
            if (suggestedReorder.compareTo(BigDecimal.ZERO) < 0) suggestedReorder = BigDecimal.ZERO;

            results.add(new ForecastItemResponse(
                    itemType, itemId, namesByKey.getOrDefault(key, "Item #" + itemId),
                    currentStock, avgMonthly, predictedQty,
                    suggestedReorder.setScale(2, RoundingMode.HALF_UP),
                    forecast.trend(), forecast.confidence()
            ));
        }

        results.sort((a, b) -> b.getPredictedNextMonthQty().compareTo(a.getPredictedNextMonthQty()));
        return results;
    }

    public List<ForecastItemResponse> topPredictedSellers(int limit) {
        return predictAllItems().stream().limit(limit).collect(Collectors.toList());
    }

    /** Builds "PRODUCT:id" / "RAW_MATERIAL:id" -> monthly quantity series (oldest to newest). */
    private Map<String, double[]> buildMonthlySeries() {
        YearMonth currentMonth = YearMonth.now();
        List<YearMonth> months = new ArrayList<>();
        for (int i = historyMonths - 1; i >= 0; i--) {
            months.add(currentMonth.minusMonths(i));
        }

        Map<String, double[]> series = new LinkedHashMap<>();
        for (int i = 0; i < months.size(); i++) {
            YearMonth ym = months.get(i);
            LocalDateTime from = ym.atDay(1).atStartOfDay();
            LocalDateTime to = ym.atEndOfMonth().atTime(23, 59, 59);

            List<com.posapp.repository.SaleItemRepository.ItemSalesAggregate> aggregates =
                    saleItemRepository.aggregateByItem(from, to);

            for (var agg : aggregates) {
                String key = agg.getItemType() + ":" + agg.getItemId();
                double[] arr = series.computeIfAbsent(key, k -> new double[months.size()]);
                arr[i] = agg.getTotalQty() == null ? 0 : agg.getTotalQty().doubleValue();
            }
        }
        return series;
    }

    private Forecast forecast(double[] series) {
        int n = series.length;
        int nonZeroMonths = (int) Arrays.stream(series).filter(v -> v > 0).count();

        if (nonZeroMonths == 0) {
            return new Forecast(0, "STABLE", "LOW");
        }
        if (nonZeroMonths == 1) {
            double lastValue = Arrays.stream(series).filter(v -> v > 0).findFirst().orElse(0);
            return new Forecast(lastValue, "STABLE", "LOW");
        }

        // Least-squares linear regression: quantity ~ a + b * monthIndex
        double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (int i = 0; i < n; i++) {
            sumX += i;
            sumY += series[i];
            sumXY += i * series[i];
            sumXX += (double) i * i;
        }
        double denom = (n * sumXX - sumX * sumX);
        double slope = denom == 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
        double intercept = (sumY - slope * sumX) / n;
        double predictedNext = intercept + slope * n;

        // blend with a recency-weighted average so a single spike/dip can't dominate
        double weightedSum = 0, weightTotal = 0;
        for (int i = 0; i < n; i++) {
            double weight = i + 1; // later months weigh more
            weightedSum += series[i] * weight;
            weightTotal += weight;
        }
        double weightedAvg = weightTotal == 0 ? 0 : weightedSum / weightTotal;
        double blended = (predictedNext * 0.6) + (weightedAvg * 0.4);

        double avg = Arrays.stream(series).average().orElse(0);
        String trend = "STABLE";
        if (avg > 0) {
            double relSlope = slope / Math.max(avg, 1);
            if (relSlope > 0.12) trend = "RISING";
            else if (relSlope < -0.12) trend = "FALLING";
        }

        String confidence = nonZeroMonths >= 4 ? "HIGH" : nonZeroMonths >= 2 ? "MEDIUM" : "LOW";

        return new Forecast(Math.max(0, blended), trend, confidence);
    }

    private record Forecast(double predictedNext, String trend, String confidence) {}
}

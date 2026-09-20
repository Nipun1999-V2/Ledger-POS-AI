package com.posapp.controller;

import com.posapp.enums.AlertStatus;
import com.posapp.repository.ProductRepository;
import com.posapp.repository.RawMaterialRepository;
import com.posapp.repository.StockAlertRepository;
import com.posapp.service.ForecastService;
import com.posapp.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ReportService reportService;
    private final ForecastService forecastService;
    private final StockAlertRepository stockAlertRepository;
    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("today", reportService.today());
        summary.put("topPredictedSellers", forecastService.topPredictedSellers(5));
        summary.put("openStockAlerts", stockAlertRepository.findByStatusOrderByCreatedAtDesc(AlertStatus.OPEN));
        summary.put("totalActiveProducts", productRepository.findByActiveTrue().size());
        summary.put("totalActiveRawMaterials", rawMaterialRepository.findByActiveTrue().size());
        return summary;
    }
}

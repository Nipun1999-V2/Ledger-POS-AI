package com.posapp.controller;

import com.posapp.entity.StockAlert;
import com.posapp.enums.AlertStatus;
import com.posapp.repository.StockAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/stock-alerts")
@RequiredArgsConstructor
public class StockAlertController {

    private final StockAlertRepository stockAlertRepository;

    @GetMapping
    public List<StockAlert> open() {
        return stockAlertRepository.findByStatusOrderByCreatedAtDesc(AlertStatus.OPEN);
    }

    @GetMapping("/history")
    public List<StockAlert> history() {
        return stockAlertRepository.findAll();
    }

    @PostMapping("/{id}/resolve")
    public StockAlert resolve(@PathVariable Long id) {
        StockAlert alert = stockAlertRepository.findById(id).orElseThrow();
        alert.setStatus(AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());
        return stockAlertRepository.save(alert);
    }
}

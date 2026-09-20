package com.posapp.controller;

import com.posapp.dto.request.SaleRequest;
import com.posapp.entity.Sale;
import com.posapp.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @PostMapping("/checkout")
    public Sale checkout(@RequestBody SaleRequest request) {
        return saleService.checkout(request);
    }

    @GetMapping("/{id}")
    public Sale get(@PathVariable Long id) {
        return saleService.findById(id);
    }

    @GetMapping
    public List<Sale> byDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return saleService.findByDateRange(from.atStartOfDay(), to.atTime(23, 59, 59));
    }
}

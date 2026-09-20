package com.posapp.controller;

import com.posapp.dto.response.AnalyticsReportResponse;
import com.posapp.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/ai/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/today")
    public AnalyticsReportResponse today() {
        return reportService.today();
    }

    @GetMapping("/this-week")
    public AnalyticsReportResponse thisWeek() {
        return reportService.thisWeek();
    }

    @GetMapping("/this-month")
    public AnalyticsReportResponse thisMonth() {
        return reportService.thisMonth();
    }

    @GetMapping("/custom")
    public AnalyticsReportResponse custom(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(defaultValue = "CUSTOM") String periodType) {
        return reportService.generate(periodType, start, end);
    }
}

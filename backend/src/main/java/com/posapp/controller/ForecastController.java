package com.posapp.controller;

import com.posapp.dto.response.ForecastItemResponse;
import com.posapp.service.ForecastService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/forecast")
@RequiredArgsConstructor
public class ForecastController {

    private final ForecastService forecastService;

    /** Full predicted-next-month demand for every item, most in-demand first. */
    @GetMapping
    public List<ForecastItemResponse> all() {
        return forecastService.predictAllItems();
    }

    /** "What will be our best sellers next month" - top N by predicted quantity. */
    @GetMapping("/top-sellers")
    public List<ForecastItemResponse> topSellers(@RequestParam(defaultValue = "5") int limit) {
        return forecastService.topPredictedSellers(limit);
    }
}

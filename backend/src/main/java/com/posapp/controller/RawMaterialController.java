package com.posapp.controller;

import com.posapp.dto.request.RawMaterialRequest;
import com.posapp.dto.request.StockAdjustmentRequest;
import com.posapp.entity.RawMaterial;
import com.posapp.enums.MovementType;
import com.posapp.service.RawMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/raw-materials")
@RequiredArgsConstructor
public class RawMaterialController {

    private final RawMaterialService rawMaterialService;

    @GetMapping
    public List<RawMaterial> all() {
        return rawMaterialService.findAll();
    }

    @GetMapping("/{id}")
    public RawMaterial get(@PathVariable Long id) {
        return rawMaterialService.findById(id);
    }

    @PostMapping
    public RawMaterial create(@RequestBody RawMaterialRequest request) {
        return rawMaterialService.create(request);
    }

    @PutMapping("/{id}")
    public RawMaterial update(@PathVariable Long id, @RequestBody RawMaterialRequest request) {
        return rawMaterialService.update(id, request);
    }

    @PostMapping("/{id}/restock")
    public RawMaterial restock(@PathVariable Long id, @RequestBody StockAdjustmentRequest request) {
        return rawMaterialService.adjustStock(id, request.getQuantity().abs(), request.getNote(), MovementType.PURCHASE_IN);
    }

    @PostMapping("/{id}/adjust")
    public RawMaterial adjust(@PathVariable Long id, @RequestBody StockAdjustmentRequest request) {
        return rawMaterialService.adjustStock(id, request.getQuantity(), request.getNote(), MovementType.ADJUSTMENT);
    }

    @DeleteMapping("/{id}")
    public void deactivate(@PathVariable Long id) {
        rawMaterialService.deactivate(id);
    }
}

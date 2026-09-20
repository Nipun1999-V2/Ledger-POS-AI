package com.posapp.controller;

import com.posapp.entity.Category;
import com.posapp.enums.CatalogType;
import com.posapp.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public List<Category> all(@RequestParam(required = false) CatalogType type) {
        return type == null ? categoryRepository.findAll() : categoryRepository.findByType(type);
    }

    @PostMapping
    public Category create(@RequestBody Category category) {
        return categoryRepository.save(category);
    }
}

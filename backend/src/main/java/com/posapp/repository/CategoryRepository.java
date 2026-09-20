package com.posapp.repository;

import com.posapp.entity.Category;
import com.posapp.enums.CatalogType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByType(CatalogType type);
}

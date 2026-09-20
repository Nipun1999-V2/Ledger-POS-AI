package com.posapp.repository;

import com.posapp.entity.ProductRecipeItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRecipeItemRepository extends JpaRepository<ProductRecipeItem, Long> {
    List<ProductRecipeItem> findByProductId(Long productId);
}

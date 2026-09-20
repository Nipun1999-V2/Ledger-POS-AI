package com.posapp.repository;

import com.posapp.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findBySaleDateBetween(LocalDateTime from, LocalDateTime to);
    long countBySaleDateBetween(LocalDateTime from, LocalDateTime to);
}

package com.posapp.repository;

import com.posapp.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    @Query("select si from SaleItem si where si.sale.saleDate between :from and :to and si.sale.status = 'COMPLETED'")
    List<SaleItem> findAllInPeriod(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("select si.itemType as itemType, si.itemId as itemId, si.itemName as itemName, " +
           "sum(si.quantity) as totalQty, sum(si.lineTotal) as totalRevenue " +
           "from SaleItem si where si.sale.saleDate between :from and :to and si.sale.status = 'COMPLETED' " +
           "group by si.itemType, si.itemId, si.itemName order by totalQty desc")
    List<ItemSalesAggregate> aggregateByItem(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    interface ItemSalesAggregate {
        String getItemType();
        Long getItemId();
        String getItemName();
        java.math.BigDecimal getTotalQty();
        java.math.BigDecimal getTotalRevenue();
    }
}

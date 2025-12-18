package com.example.seatrans.features.logistics.repository;

import com.example.seatrans.features.logistics.model.QuotationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuotationItemRepository extends JpaRepository<QuotationItem, Long> {
    
    List<QuotationItem> findByQuotationId(Long quotationId);
    
    @Query("SELECT qi FROM QuotationItem qi WHERE qi.quotationId = :quotationId ORDER BY qi.displayOrder ASC")
    List<QuotationItem> findByQuotationIdOrderByDisplayOrder(@Param("quotationId") Long quotationId);
    
    List<QuotationItem> findByQuotationIdAndItemCategory(Long quotationId, String itemCategory);
    
    void deleteByQuotationId(Long quotationId);
}

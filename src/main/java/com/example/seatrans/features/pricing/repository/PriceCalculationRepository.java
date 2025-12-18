package com.example.seatrans.features.pricing.repository;

import com.example.seatrans.features.pricing.model.PriceCalculation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceCalculationRepository extends JpaRepository<PriceCalculation, Long> {
    
    List<PriceCalculation> findByQuotationId(Long quotationId);
    
    @Query("SELECT pc FROM PriceCalculation pc WHERE pc.quotationId = :quotationId ORDER BY pc.stepOrder ASC")
    List<PriceCalculation> findByQuotationIdOrderByStepOrder(@Param("quotationId") Long quotationId);
    
    void deleteByQuotationId(Long quotationId);
}

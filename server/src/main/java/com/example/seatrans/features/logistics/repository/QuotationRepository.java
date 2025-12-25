package com.example.seatrans.features.logistics.repository;

import com.example.seatrans.features.logistics.model.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    
    Optional<Quotation> findByQuoteCode(String quoteCode);
    
    Optional<Quotation> findByRequestId(Long requestId);
    
    List<Quotation> findByCustomerId(Long customerId);
    
    List<Quotation> findByCustomerIdAndQuoteStatus(Long customerId, String quoteStatus);
    
    List<Quotation> findByEmployeeId(Long employeeId);
    
    List<Quotation> findByQuoteStatus(String quoteStatus);
    
    @Query("SELECT q FROM Quotation q WHERE q.quoteStatus = 'SENT' AND q.validUntil < :today")
    List<Quotation> findExpiredQuotations(@Param("today") LocalDate today);
    
    @Query("SELECT q FROM Quotation q WHERE q.quoteStatus = 'SENT' AND q.validUntil BETWEEN :today AND :expiryDate")
    List<Quotation> findQuotationsExpiringSoon(@Param("today") LocalDate today, @Param("expiryDate") LocalDate expiryDate);
    
    @Query("SELECT q FROM Quotation q WHERE q.customerId = :customerId AND q.serviceType = :serviceType ORDER BY q.quoteDate DESC")
    List<Quotation> findByCustomerIdAndServiceTypeOrderByQuoteDateDesc(
        @Param("customerId") Long customerId, 
        @Param("serviceType") String serviceType
    );
    
    Long countByQuoteStatus(String quoteStatus);
    
    Long countByEmployeeIdAndQuoteStatus(Long employeeId, String quoteStatus);
}

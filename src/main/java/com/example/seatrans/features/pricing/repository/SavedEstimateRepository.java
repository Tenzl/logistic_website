package com.example.seatrans.features.pricing.repository;

import com.example.seatrans.features.pricing.model.SavedEstimate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SavedEstimateRepository extends JpaRepository<SavedEstimate, Long> {
    
    Optional<SavedEstimate> findByEstimateCode(String estimateCode);
    
    List<SavedEstimate> findBySessionId(String sessionId);
    
    List<SavedEstimate> findByEmail(String email);
    
    @Query("SELECT se FROM SavedEstimate se WHERE se.expiresAt < :now AND se.convertedToRequestId IS NULL")
    List<SavedEstimate> findExpiredEstimates(@Param("now") LocalDateTime now);
    
    void deleteByExpiresAtBeforeAndConvertedToRequestIdIsNull(LocalDateTime expiryDate);
}

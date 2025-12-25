package com.example.seatrans.features.pricing.repository;

import com.example.seatrans.features.pricing.model.RateTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RateTableRepository extends JpaRepository<RateTable, Long> {
    
    List<RateTable> findByServiceType(String serviceType);
    
    List<RateTable> findByServiceTypeAndRateCategory(String serviceType, String rateCategory);
    
    @Query("SELECT rt FROM RateTable rt WHERE rt.serviceType = :serviceType " +
           "AND rt.rateCategory = :rateCategory " +
           "AND rt.fromLocation = :fromLocation " +
           "AND (rt.toLocation = :toLocation OR rt.toLocation IS NULL) " +
           "AND rt.isActive = true " +
           "AND rt.validFrom <= :date " +
           "AND (rt.validTo IS NULL OR rt.validTo >= :date)")
    Optional<RateTable> findActiveRate(
        @Param("serviceType") String serviceType,
        @Param("rateCategory") String rateCategory,
        @Param("fromLocation") String fromLocation,
        @Param("toLocation") String toLocation,
        @Param("date") LocalDate date
    );
    
    @Query("SELECT rt FROM RateTable rt WHERE rt.serviceType = :serviceType " +
           "AND rt.isActive = true " +
           "AND rt.validFrom <= :date " +
           "AND (rt.validTo IS NULL OR rt.validTo >= :date)")
    List<RateTable> findActiveRatesByServiceType(
        @Param("serviceType") String serviceType,
        @Param("date") LocalDate date
    );
}

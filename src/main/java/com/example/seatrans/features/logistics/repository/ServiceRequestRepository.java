package com.example.seatrans.features.logistics.repository;

import com.example.seatrans.features.logistics.model.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    
    Optional<ServiceRequest> findByRequestCode(String requestCode);
    
    List<ServiceRequest> findByCustomerId(Long customerId);
    
    List<ServiceRequest> findByCustomerIdAndServiceType(Long customerId, String serviceType);
    
    List<ServiceRequest> findByCustomerIdAndRequestStatus(Long customerId, String requestStatus);
    
    List<ServiceRequest> findByRequestStatus(String requestStatus);
    
    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.requestStatus = :status AND sr.expiresAt < :now")
    List<ServiceRequest> findExpiredRequests(@Param("status") String status, @Param("now") LocalDateTime now);
    
    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.customerId = :customerId ORDER BY sr.createdAt DESC")
    List<ServiceRequest> findByCustomerIdOrderByCreatedAtDesc(@Param("customerId") Long customerId);
    
    Long countByRequestStatus(String requestStatus);
}

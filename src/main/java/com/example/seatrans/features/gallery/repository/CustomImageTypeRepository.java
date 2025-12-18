package com.example.seatrans.features.gallery.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.logistics.model.ServiceType;
import com.example.seatrans.features.gallery.model.CustomImageType;

/**
 * Repository for Custom Image Type
 */
@Repository
public interface CustomImageTypeRepository extends JpaRepository<CustomImageType, Long> {
    
    /**
     * Find all active types by service
     */
    List<CustomImageType> findByServiceTypeAndIsActiveTrueOrderByDisplayOrder(ServiceType serviceType);
    
    /**
     * Find all types by service (including inactive)
     */
    List<CustomImageType> findByServiceTypeOrderByDisplayOrder(ServiceType serviceType);
    
    /**
     * Find by service and code (unique)
     */
    Optional<CustomImageType> findByServiceTypeAndCode(ServiceType serviceType, String code);
    
    /**
     * Check if code exists for service
     */
    boolean existsByServiceTypeAndCode(ServiceType serviceType, String code);
    
    /**
     * Find max display order for service
     */
    Optional<CustomImageType> findFirstByServiceTypeOrderByDisplayOrderDesc(ServiceType serviceType);
}

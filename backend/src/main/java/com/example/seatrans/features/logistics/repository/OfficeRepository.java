package com.example.seatrans.features.logistics.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.logistics.model.Office;

@Repository
public interface OfficeRepository extends JpaRepository<Office, Long> {
    
    List<Office> findByIsActiveTrueOrderByIsHeadquarterDescNameAsc();
    
    @Query("SELECT o FROM Office o WHERE o.isActive = true ORDER BY o.isHeadquarter DESC, o.name ASC")
    List<Office> findAllActiveOffices();
}

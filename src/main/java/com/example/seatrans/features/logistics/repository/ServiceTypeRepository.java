package com.example.seatrans.features.logistics.repository;

import com.example.seatrans.features.logistics.model.ServiceTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceTypeRepository extends JpaRepository<ServiceTypeEntity, Long> {
    Optional<ServiceTypeEntity> findByName(String name);
    List<ServiceTypeEntity> findByIsActiveTrue();
    List<ServiceTypeEntity> findByNameContainingIgnoreCase(String name);
}

package com.example.seatrans.features.gallery.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.gallery.model.ImageTypeEntity;

@Repository
public interface ImageTypeRepository extends JpaRepository<ImageTypeEntity, Long> {
    Optional<ImageTypeEntity> findByName(String name);
    Optional<ImageTypeEntity> findByNameAndServiceTypeId(String name, Long serviceTypeId);
    List<ImageTypeEntity> findByServiceTypeId(Long serviceTypeId);
    List<ImageTypeEntity> findByServiceTypeIdAndIsActiveTrue(Long serviceTypeId);
    List<ImageTypeEntity> findByNameContainingIgnoreCase(String name);
    List<ImageTypeEntity> findByIsActiveTrue();
}

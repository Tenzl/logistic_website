package com.example.seatrans.features.gallery.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.gallery.model.CargoTypeCatalogEntity;
import com.example.seatrans.features.gallery.model.CargoTypeCatalogId;

@Repository
public interface CargoTypeCatalogRepository extends JpaRepository<CargoTypeCatalogEntity, CargoTypeCatalogId> {
    List<CargoTypeCatalogEntity> findByServiceTypeTypeAndIsActiveTrueOrderByDisplayLabelAsc(String serviceTypeType);
}

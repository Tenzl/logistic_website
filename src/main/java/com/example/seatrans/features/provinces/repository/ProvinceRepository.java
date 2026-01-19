package com.example.seatrans.features.provinces.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.provinces.model.Province;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, Long> {
    Optional<Province> findByName(String name);
    List<Province> findByIsActiveTrue();
    List<Province> findByNameContainingIgnoreCase(String name);
}

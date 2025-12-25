package com.example.seatrans.features.logistics.repository;

import com.example.seatrans.features.logistics.model.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, Long> {
    Optional<Province> findByName(String name);
    List<Province> findByIsActiveTrue();
    List<Province> findByNameContainingIgnoreCase(String name);
}

package com.example.seatrans.features.ports.repository;

import com.example.seatrans.features.ports.model.Port;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortRepository extends JpaRepository<Port, Long> {
    Optional<Port> findByName(String name);
    Optional<Port> findByNameAndProvinceId(String name, Long provinceId);
    List<Port> findByProvinceId(Long provinceId);
    List<Port> findByProvinceIdAndIsActiveTrue(Long provinceId);
    List<Port> findByNameContainingIgnoreCase(String name);
    List<Port> findByIsActiveTrue();
}

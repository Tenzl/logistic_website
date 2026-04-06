package com.example.seatrans.features.ports.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.ports.model.Port;

@Repository
public interface PortRepository extends JpaRepository<Port, Long> {
    Optional<Port> findByName(String name);
    Optional<Port> findByNameAndProvinceId(String name, Long provinceId);
    Optional<Port> findByNameAndProvinceIsNull(String name);
    List<Port> findByProvinceId(Long provinceId);
    List<Port> findByProvinceIdAndIsActiveTrue(Long provinceId);
    List<Port> findByNameContainingIgnoreCase(String name);
    List<Port> findByIsActiveTrue();

    /** Chỉ lấy cột name — dùng cho duplicate check khi import, tránh load toàn bộ entity */
    @Query("SELECT p.name FROM Port p")
    List<String> findAllNames();
}

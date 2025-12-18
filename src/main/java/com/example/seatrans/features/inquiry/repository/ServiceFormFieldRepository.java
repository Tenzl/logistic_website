package com.example.seatrans.features.inquiry.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.seatrans.features.inquiry.model.ServiceFormField;

public interface ServiceFormFieldRepository extends JpaRepository<ServiceFormField, Long> {
    List<ServiceFormField> findByServiceTypeIdOrderByPositionAsc(Long serviceTypeId);
    List<ServiceFormField> findByServiceTypeIdAndIsActiveTrueOrderByPositionAsc(Long serviceTypeId);
    Optional<ServiceFormField> findByServiceTypeIdAndKey(Long serviceTypeId, String key);
}

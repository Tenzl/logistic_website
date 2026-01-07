package com.example.seatrans.features.inquiry.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.inquiry.model.InquiryStatus;
import com.example.seatrans.features.inquiry.model.ShippingAgencyInquiry;

@Repository
public interface ShippingAgencyInquiryRepository extends JpaRepository<ShippingAgencyInquiry, Long> {
    Page<ShippingAgencyInquiry> findByStatus(InquiryStatus status, Pageable pageable);
    Page<ShippingAgencyInquiry> findByUserId(Long userId, Pageable pageable);
}

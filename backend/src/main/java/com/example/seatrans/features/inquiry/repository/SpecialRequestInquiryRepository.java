package com.example.seatrans.features.inquiry.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.inquiry.model.InquiryStatus;
import com.example.seatrans.features.inquiry.model.SpecialRequestInquiry;

@Repository
public interface SpecialRequestInquiryRepository extends JpaRepository<SpecialRequestInquiry, Long> {
    Page<SpecialRequestInquiry> findByStatus(InquiryStatus status, Pageable pageable);
    Page<SpecialRequestInquiry> findByUserId(Long userId, Pageable pageable);
    Page<SpecialRequestInquiry> findByUserIdAndStatus(Long userId, InquiryStatus status, Pageable pageable);
}

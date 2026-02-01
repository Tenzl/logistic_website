package com.example.seatrans.features.inquiry.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.inquiry.model.FreightForwardingInquiry;
import com.example.seatrans.features.inquiry.model.InquiryStatus;

@Repository
public interface FreightForwardingInquiryRepository extends JpaRepository<FreightForwardingInquiry, Long> {
    Page<FreightForwardingInquiry> findByStatus(InquiryStatus status, Pageable pageable);
    Page<FreightForwardingInquiry> findByUserId(Long userId, Pageable pageable);
    Page<FreightForwardingInquiry> findByUserIdAndStatus(Long userId, InquiryStatus status, Pageable pageable);
}

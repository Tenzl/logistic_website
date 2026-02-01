package com.example.seatrans.features.inquiry.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.inquiry.model.InquiryStatus;
import com.example.seatrans.features.inquiry.model.TotalLogisticInquiry;

@Repository
public interface TotalLogisticInquiryRepository extends JpaRepository<TotalLogisticInquiry, Long> {
    Page<TotalLogisticInquiry> findByStatus(InquiryStatus status, Pageable pageable);
    Page<TotalLogisticInquiry> findByUserId(Long userId, Pageable pageable);
    Page<TotalLogisticInquiry> findByUserIdAndStatus(Long userId, InquiryStatus status, Pageable pageable);
}

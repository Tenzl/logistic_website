package com.example.seatrans.features.inquiry.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.inquiry.model.CharteringBrokingInquiry;
import com.example.seatrans.features.inquiry.model.InquiryStatus;

@Repository
public interface CharteringBrokingInquiryRepository extends JpaRepository<CharteringBrokingInquiry, Long> {
    Page<CharteringBrokingInquiry> findByStatus(InquiryStatus status, Pageable pageable);
    Page<CharteringBrokingInquiry> findByUserId(Long userId, Pageable pageable);
}

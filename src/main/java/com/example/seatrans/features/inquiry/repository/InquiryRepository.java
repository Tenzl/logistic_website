package com.example.seatrans.features.inquiry.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.inquiry.model.InquiryStatus;
import com.example.seatrans.features.inquiry.model.ServiceInquiry;

@Repository
public interface InquiryRepository extends JpaRepository<ServiceInquiry, Long> {
    List<ServiceInquiry> findByServiceTypeId(Long serviceTypeId);
    List<ServiceInquiry> findByStatus(InquiryStatus status);
    Page<ServiceInquiry> findByServiceTypeIdAndStatus(Long serviceTypeId, InquiryStatus status, Pageable pageable);
    Page<ServiceInquiry> findByServiceTypeId(Long serviceTypeId, Pageable pageable);
    Page<ServiceInquiry> findByStatus(InquiryStatus status, Pageable pageable);
    Page<ServiceInquiry> findAll(Pageable pageable);
    Page<ServiceInquiry> findByContactInfoContainingIgnoreCase(String contactInfo, Pageable pageable);
    List<ServiceInquiry> findTop10ByOrderBySubmittedAtDesc();
    List<ServiceInquiry> findBySubmittedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    Long countByStatus(InquiryStatus status);
    Long countByServiceTypeId(Long serviceTypeId);

    @Query("SELECT i FROM ServiceInquiry i WHERE i.serviceType.id = :serviceTypeId AND i.status = :status ORDER BY i.submittedAt DESC")
    List<ServiceInquiry> findPendingByServiceType(@Param("serviceTypeId") Long serviceTypeId, @Param("status") InquiryStatus status);

    List<ServiceInquiry> findByProcessedById(Long userId);
}

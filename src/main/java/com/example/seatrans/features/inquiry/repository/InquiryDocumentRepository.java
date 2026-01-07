package com.example.seatrans.features.inquiry.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.inquiry.model.InquiryDocument;
import com.example.seatrans.features.inquiry.model.InquiryDocument.DocumentType;

@Repository
public interface InquiryDocumentRepository extends JpaRepository<InquiryDocument, Long> {
    
    List<InquiryDocument> findByServiceSlugAndTargetId(String serviceSlug, Long targetId);
    List<InquiryDocument> findByServiceSlugAndTargetIdAndDocumentType(String serviceSlug, Long targetId, DocumentType documentType);
    List<InquiryDocument> findByServiceSlugAndTargetIdAndIsActiveTrue(String serviceSlug, Long targetId);
    boolean existsByServiceSlugAndTargetIdAndFileName(String serviceSlug, Long targetId, String fileName);
    void deleteByServiceSlugAndTargetId(String serviceSlug, Long targetId);
}

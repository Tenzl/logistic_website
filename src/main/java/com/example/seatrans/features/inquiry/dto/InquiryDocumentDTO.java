package com.example.seatrans.features.inquiry.dto;

import java.time.LocalDateTime;

import com.example.seatrans.features.inquiry.model.InquiryDocument.DocumentType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryDocumentDTO {
    private Long id;
    private String serviceSlug;
    private Long targetId;
    private DocumentType documentType;
    private String fileName;
    private String originalFileName;
    private Long fileSize;
    private String mimeType;
    private String description;
    private LocalDateTime uploadedAt;
    private String uploadedByName;
    private String uploadedByEmail;
    private Integer version;
    private String checksum;
    private Boolean isActive;
}

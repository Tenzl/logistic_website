package com.example.seatrans.features.inquiry.dto;

import com.example.seatrans.features.inquiry.model.InquiryDocument.DocumentType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for uploading inquiry documents
 * Áp dụng trong việc tải lên các tài liệu (Invoice, Quotation, etc.)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryDocumentUploadRequest {
    private DocumentType documentType;
    private String description;
    private String fileName;
    private Long fileSize;
    private String mimeType;
}

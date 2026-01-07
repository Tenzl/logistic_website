package com.example.seatrans.features.inquiry.model;

import java.time.LocalDateTime;

import com.example.seatrans.features.auth.model.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Inquiry Document - Lưu trữ các tài liệu đi kèm với inquiry (Invoice, Quotation, etc.)
 * Tuân thủ chuẩn doanh nghiệp với audit trail, versioning, và file management
 */
@Entity
@Table(name = "inquiry_documents", indexes = {
    @Index(name = "idx_inquiry_id", columnList = "inquiry_id"),
    @Index(name = "idx_document_type", columnList = "document_type"),
    @Index(name = "idx_uploaded_at", columnList = "uploaded_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "service_slug", nullable = false, length = 100)
    private String serviceSlug;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 50)
    private DocumentType documentType;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "file_path", nullable = false, length = 512)
    private String filePath;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "version", nullable = false)
    @Builder.Default
    private Integer version = 1;

    @Column(name = "checksum", length = 64)
    private String checksum;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        isActive = true;
        version = 1;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Document Type - Phân loại tài liệu
     */
    public enum DocumentType {
        INVOICE("Invoice", "Hóa đơn"),
        QUOTATION("Quotation", "Báo giá"),
        PROFORMA_INVOICE("Proforma Invoice", "Hóa đơn kế toán"),
        DELIVERY_RECEIPT("Delivery Receipt", "Biên bản giao nhận"),
        SPECIFICATION("Specification", "Thông số kỹ thuật"),
        OTHER("Other", "Khác");

        private final String displayName;
        private final String displayNameVn;

        DocumentType(String displayName, String displayNameVn) {
            this.displayName = displayName;
            this.displayNameVn = displayNameVn;
        }

        public String getDisplayName() {
            return displayName;
        }

        public String getDisplayNameVn() {
            return displayNameVn;
        }
    }
}

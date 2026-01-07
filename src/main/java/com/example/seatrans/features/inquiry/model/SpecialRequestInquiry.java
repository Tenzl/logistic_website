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
 * Special Request Inquiry Detail
 * Contains specific fields for special/custom requests from contact page
 */
@Entity
@Table(name = "special_request_inquiries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecialRequestInquiry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    @Builder.Default
    private InquiryStatus status = InquiryStatus.PROCESSING;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;
    
    // Subject of the special request
    @Column(name = "subject", length = 500)
    private String subject;
    
    // Preferred province ID (optional)
    @Column(name = "preferred_province_id")
    private Long preferredProvinceId;
    
    // Preferred province name (for display)
    @Column(name = "preferred_province_name", length = 255)
    private String preferredProvinceName;
    
    // Related department/service type ID (optional)
    @Column(name = "related_department_id")
    private Long relatedDepartmentId;
    
    // Related department name (for display)
    @Column(name = "related_department_name", length = 255)
    private String relatedDepartmentName;
    
    // Detailed message of the request
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
    
    // Additional information
    @Column(name = "other_info", columnDefinition = "TEXT")
    private String otherInfo;

    @PrePersist
    protected void onCreate() {
        if (this.submittedAt == null) {
            this.submittedAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

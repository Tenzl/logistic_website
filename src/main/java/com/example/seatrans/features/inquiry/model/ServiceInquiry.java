package com.example.seatrans.features.inquiry.model;

import java.time.LocalDateTime;

import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.logistics.model.ServiceTypeEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Service Inquiry Entity - Common fields for all inquiry types
 */
@Entity
@Table(name = "service_inquiries", indexes = {
    @Index(name = "idx_service_type", columnList = "service_type_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_submitted_at", columnList = "submitted_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceInquiry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "imageTypes", "formFields"})
    private ServiceTypeEntity serviceType;
    
    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;
    
    @Column(name = "contact_info", nullable = false, length = 255)
    private String contactInfo;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "company", length = 255)
    private String company;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private InquiryStatus status = InquiryStatus.PENDING;
    
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "roles"})
    private User processedBy;
    
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String details;
    
    // One-to-One relationships with service-specific details
    @OneToOne(mappedBy = "inquiry", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private ShippingAgencyInquiry shippingAgencyDetail;
    
    @OneToOne(mappedBy = "inquiry", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private CharteringBrokingInquiry charteringBrokingDetail;
    
    @OneToOne(mappedBy = "inquiry", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private FreightForwardingInquiry freightForwardingDetail;
    
    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper methods to maintain bidirectional relationships
    public void setShippingAgencyDetail(ShippingAgencyInquiry detail) {
        this.shippingAgencyDetail = detail;
        if (detail != null) {
            detail.setInquiry(this);
        }
    }
    
    public void setCharteringBrokingDetail(CharteringBrokingInquiry detail) {
        this.charteringBrokingDetail = detail;
        if (detail != null) {
            detail.setInquiry(this);
        }
    }
    
    public void setFreightForwardingDetail(FreightForwardingInquiry detail) {
        this.freightForwardingDetail = detail;
        if (detail != null) {
            detail.setInquiry(this);
        }
    }
}

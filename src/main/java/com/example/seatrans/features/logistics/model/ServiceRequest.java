package com.example.seatrans.features.logistics.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "request_code", unique = true, nullable = false, length = 50)
    private String requestCode;
    
    @Column(name = "customer_id", nullable = false)
    private Long customerId;
    
    @Column(name = "service_type", nullable = false, length = 50)
    private String serviceType;
    
    @Builder.Default
    @Column(name = "request_status", length = 20)
    private String requestStatus = "DRAFT";
    
    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;
    
    @Column(name = "contact_info", nullable = false, length = 500)
    private String contactInfo;
    
    @Column(name = "other_information", columnDefinition = "TEXT")
    private String otherInformation;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "service_data", nullable = false, columnDefinition = "json")
    private String serviceData;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    @Column(name = "quoted_at")
    private LocalDateTime quotedAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

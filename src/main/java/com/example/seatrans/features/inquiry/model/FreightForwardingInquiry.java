package com.example.seatrans.features.inquiry.model;

import java.time.LocalDate;
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
 * Freight Forwarding Inquiry Detail
 * Contains specific fields for freight forwarding quotes
 */
@Entity
@Table(name = "freight_forwarding_inquiries", indexes = {
    @Index(name = "idx_freight_route", columnList = "loading_port, discharging_port"),
    @Index(name = "idx_freight_shipment", columnList = "shipment_from, shipment_to")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FreightForwardingInquiry {
    
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
    
    // Cargo details
    @Column(name = "cargo_name", nullable = false, length = 255)
    private String cargoName; // Type of cargo
    
    @Column(name = "delivery_term", nullable = false, length = 100)
    private String deliveryTerm; // EXW, FOB, CIF, etc.
    
    // Container quantities
    @Column(name = "container_20ft")
    @Builder.Default
    private Integer container20ft = 0;
    
    @Column(name = "container_40ft")
    @Builder.Default
    private Integer container40ft = 0;
    
    // Route
    @Column(name = "loading_port", nullable = false, length = 255)
    private String loadingPort;
    
    @Column(name = "discharging_port", nullable = false, length = 255)
    private String dischargingPort;
    
    // Shipment time window
    @Column(name = "shipment_from", nullable = false)
    private LocalDate shipmentFrom;
    
    @Column(name = "shipment_to", nullable = false)
    private LocalDate shipmentTo;

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

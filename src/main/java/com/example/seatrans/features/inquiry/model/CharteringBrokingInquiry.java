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
 * Chartering & Broking Inquiry Detail
 * Contains specific fields for tonnage/vessel orders
 */
@Entity
@Table(name = "chartering_broking_inquiries", indexes = {
    @Index(name = "idx_chartering_laycan", columnList = "laycan_from, laycan_to")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CharteringBrokingInquiry {
    
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
    @Column(name = "cargo_quantity", nullable = false, length = 255)
    private String cargoQuantity; // e.g., "Tapioca chip 15,000 tons"
    
    // Route
    @Column(name = "loading_port", nullable = false, length = 255)
    private String loadingPort;
    
    @Column(name = "discharging_port", nullable = false, length = 255)
    private String dischargingPort;
    
    // Laycan (Lay days cancelling - time window for vessel arrival)
    @Column(name = "laycan_from", nullable = false)
    private LocalDate laycanFrom;
    
    @Column(name = "laycan_to", nullable = false)
    private LocalDate laycanTo;
    
    // Additional requirements
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

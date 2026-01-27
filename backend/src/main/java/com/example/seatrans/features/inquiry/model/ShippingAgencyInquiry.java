package com.example.seatrans.features.inquiry.model;

import java.math.BigDecimal;
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
 * Shipping Agency Inquiry Detail
 * Contains specific fields for port disbursement account inquiries
 */
@Entity
@Table(name = "shipping_agency_inquiries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAgencyInquiry {
    
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
    
    // Party / vessel info
    @Column(name = "shipowner_to", length = 255)
    private String toName; // Owner / principal

    @Column(name = "mv", length = 255)
    private String mv; // Vessel name

    @Column(name = "eta")
    private LocalDate eta; // ETA date
    
    // Vessel specifications
    @Column(precision = 10, scale = 2)
    private BigDecimal dwt; // Dead Weight Tonnage
    
    @Column(precision = 10, scale = 2)
    private BigDecimal grt; // Gross Register Tonnage
    
    @Column(precision = 8, scale = 2)
    private BigDecimal loa; // Length Overall in meters
    
    // Cargo information
    @Column(name = "cargo_type", length = 255)
    private String cargoType;
    
    @Column(name = "cargo_name", length = 255)
    private String cargoName;

    @Column(name = "cargo_name_other", length = 255)
    private String cargoNameOther;

    @Column(name = "cargo_quantity", precision = 15, scale = 3)
    private BigDecimal cargoQuantity; // tons
    
    // Port information
    @Column(name = "port_of_call", length = 255)
    private String portOfCall; // Port name
    
    @Column(name = "discharge_loading_location", length = 64)
    private String dischargeLoadingLocation; // Berth or Anchorage
    
    // Additional information
    @Column(name = "other_info", columnDefinition = "TEXT")
    private String otherInfo;

    @Column(name = "transport_ls", columnDefinition = "TEXT")
    private String transportLs;

    @Column(name = "transport_quarantine", columnDefinition = "TEXT")
    private String transportQuarantine;

    @Column(name = "frt_tax_type", length = 64)
    private String frtTaxType;

    @Column(name = "boat_hire_amount", precision = 15, scale = 2)
    private BigDecimal boatHireAmount;

    @Column(name = "tally_fee_amount", precision = 15, scale = 2)
    private BigDecimal tallyFeeAmount;

    @Column(name = "quote_form", length = 10)
    private String quoteForm;

    // Quote calculation fields
    @Column(name = "berth_hours", precision = 10, scale = 2)
    private BigDecimal berthHours;

    @Column(name = "anchorage_hours", precision = 10, scale = 2)
    private BigDecimal anchorageHours;

    @Column(name = "pilotage_3rd_miles", precision = 10, scale = 2)
    private BigDecimal pilotage3rdMiles;

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

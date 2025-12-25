package com.example.seatrans.features.inquiry.model;

import java.time.LocalDate;

import com.example.seatrans.shared.model.BaseEntity;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
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
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CharteringBrokingInquiry extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inquiry_id", nullable = false, unique = true)
    @JsonBackReference
    private ServiceInquiry inquiry;

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
}

package com.example.seatrans.features.inquiry.model;

import java.math.BigDecimal;

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
 * Shipping Agency Inquiry Detail
 * Contains specific fields for port disbursement account inquiries
 */
@Entity
@Table(name = "shipping_agency_inquiries", indexes = {
        @Index(name = "idx_shipping_port", columnList = "port_id")
})
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAgencyInquiry extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inquiry_id", nullable = false, unique = true)
    @JsonBackReference
    private ServiceInquiry inquiry;

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

    @Column(name = "cargo_quantity", length = 255)
    private String cargoQuantity;

    // Port information
    @Column(name = "port_id")
    private Long portId; // Reference to ports table

    @Column(name = "port_of_call", length = 255)
    private String portOfCall; // Selected from dropdown

    @Column(name = "port_name", length = 255)
    private String portName; // Specific terminal/berth name

    // Additional information
    @Column(name = "other_info", columnDefinition = "TEXT")
    private String otherInfo;
}

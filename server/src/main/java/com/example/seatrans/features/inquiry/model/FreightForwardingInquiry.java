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
 * Freight Forwarding Inquiry Detail
 * Contains specific fields for freight forwarding quotes
 */
@Entity
@Table(name = "freight_forwarding_inquiries", indexes = {
        @Index(name = "idx_freight_route", columnList = "loading_port, discharging_port"),
        @Index(name = "idx_freight_shipment", columnList = "shipment_from, shipment_to")
})
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FreightForwardingInquiry extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inquiry_id", nullable = false, unique = true)
    @JsonBackReference
    private ServiceInquiry inquiry;

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
}

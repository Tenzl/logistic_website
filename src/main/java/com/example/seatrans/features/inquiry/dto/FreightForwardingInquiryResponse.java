package com.example.seatrans.features.inquiry.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.seatrans.features.inquiry.model.FreightForwardingInquiry;
import com.example.seatrans.features.inquiry.model.InquiryStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreightForwardingInquiryResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String company;
    private Long userId;
    private InquiryStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
    private String notes;
    
    // Freight Forwarding specific fields
    private String cargoName;
    private String deliveryTerm;
    private Integer container20;
    private Integer container40;
    private String loadingPort;
    private String dischargingPort;
    private LocalDate shipmentFrom;
    private LocalDate shipmentTo;
    
    public static FreightForwardingInquiryResponse from(FreightForwardingInquiry inquiry) {
        return FreightForwardingInquiryResponse.builder()
            .id(inquiry.getId())
            .userId(inquiry.getUserId())
            .status(inquiry.getStatus())
            .submittedAt(inquiry.getSubmittedAt())
            .updatedAt(inquiry.getUpdatedAt())
            .notes(inquiry.getNotes())
            .cargoName(inquiry.getCargoName())
            .deliveryTerm(inquiry.getDeliveryTerm())
            .container20(inquiry.getContainer20ft())
            .container40(inquiry.getContainer40ft())
            .loadingPort(inquiry.getLoadingPort())
            .dischargingPort(inquiry.getDischargingPort())
            .shipmentFrom(inquiry.getShipmentFrom())
            .shipmentTo(inquiry.getShipmentTo())
            .build();
    }
}

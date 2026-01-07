package com.example.seatrans.features.inquiry.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.seatrans.features.inquiry.model.InquiryStatus;
import com.example.seatrans.features.inquiry.model.TotalLogisticInquiry;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TotalLogisticInquiryResponse {
    private Long id;
    private String fullName;
    private String contactInfo;
    private Long userId;
    private InquiryStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
    private String notes;
    private String details;
    
    // Total Logistics specific fields (same as Freight Forwarding)
    private String cargoName;
    private String deliveryTerm;
    private Integer container20ft;
    private Integer container40ft;
    private String loadingPort;
    private String dischargingPort;
    private LocalDate shipmentFrom;
    private LocalDate shipmentTo;
    
    public static TotalLogisticInquiryResponse from(TotalLogisticInquiry inquiry) {
        return TotalLogisticInquiryResponse.builder()
            .id(inquiry.getId())
            .fullName(inquiry.getFullName())
            .contactInfo(inquiry.getContactInfo())
            .userId(inquiry.getUserId())
            .status(inquiry.getStatus())
            .submittedAt(inquiry.getSubmittedAt())
            .updatedAt(inquiry.getUpdatedAt())
            .notes(inquiry.getNotes())
            .cargoName(inquiry.getCargoName())
            .deliveryTerm(inquiry.getDeliveryTerm())
            .container20ft(inquiry.getContainer20ft())
            .container40ft(inquiry.getContainer40ft())
            .loadingPort(inquiry.getLoadingPort())
            .dischargingPort(inquiry.getDischargingPort())
            .shipmentFrom(inquiry.getShipmentFrom())
            .shipmentTo(inquiry.getShipmentTo())
            .build();
    }
}

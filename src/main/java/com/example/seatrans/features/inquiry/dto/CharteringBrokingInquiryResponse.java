package com.example.seatrans.features.inquiry.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.seatrans.features.inquiry.model.CharteringBrokingInquiry;
import com.example.seatrans.features.inquiry.model.InquiryStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CharteringBrokingInquiryResponse {
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
    
    // Chartering & Broking specific fields
    private String cargoQuantity;
    private String loadingPort;
    private String dischargingPort;
    private LocalDate laycanFrom;
    private LocalDate laycanTo;
    private String otherInfo;
    
    public static CharteringBrokingInquiryResponse from(CharteringBrokingInquiry inquiry) {
        return CharteringBrokingInquiryResponse.builder()
            .id(inquiry.getId())
            .userId(inquiry.getUserId())
            .status(inquiry.getStatus())
            .submittedAt(inquiry.getSubmittedAt())
            .updatedAt(inquiry.getUpdatedAt())
            .notes(inquiry.getNotes())
            .cargoQuantity(inquiry.getCargoQuantity())
            .loadingPort(inquiry.getLoadingPort())
            .dischargingPort(inquiry.getDischargingPort())
            .laycanFrom(inquiry.getLaycanFrom())
            .laycanTo(inquiry.getLaycanTo())
            .otherInfo(inquiry.getOtherInfo())
            .build();
    }
}

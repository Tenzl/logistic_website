package com.example.seatrans.features.inquiry.dto;

import java.time.LocalDateTime;

import com.example.seatrans.features.inquiry.model.InquiryStatus;
import com.example.seatrans.features.inquiry.model.SpecialRequestInquiry;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecialRequestInquiryResponse {
    private Long id;
    private String fullName;
    private String contactInfo;
    private String phone;
    private String company;
    private Long userId;
    private InquiryStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
    private String notes;
    
    // Special Request specific fields
    private String subject;
    private Long preferredProvinceId;
    private String preferredProvinceName;
    private Long relatedDepartmentId;
    private String relatedDepartmentName;
    private String message;
    private String otherInfo;
    
    public static SpecialRequestInquiryResponse from(SpecialRequestInquiry inquiry) {
        return SpecialRequestInquiryResponse.builder()
            .id(inquiry.getId())
            .userId(inquiry.getUserId())
            .status(inquiry.getStatus())
            .submittedAt(inquiry.getSubmittedAt())
            .updatedAt(inquiry.getUpdatedAt())
            .notes(inquiry.getNotes())
            .subject(inquiry.getSubject())
            .preferredProvinceId(inquiry.getPreferredProvinceId())
            .preferredProvinceName(inquiry.getPreferredProvinceName())
            .relatedDepartmentId(inquiry.getRelatedDepartmentId())
            .relatedDepartmentName(inquiry.getRelatedDepartmentName())
            .message(inquiry.getMessage())
            .otherInfo(inquiry.getOtherInfo())
            .build();
    }
}

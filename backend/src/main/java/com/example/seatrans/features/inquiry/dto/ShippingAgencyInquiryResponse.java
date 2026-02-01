package com.example.seatrans.features.inquiry.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.seatrans.features.inquiry.model.InquiryStatus;
import com.example.seatrans.features.inquiry.model.ShippingAgencyInquiry;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAgencyInquiryResponse {
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
    
    // Shipping Agency specific fields
    private String toName;
    private String mv;
    private LocalDate eta;
    private BigDecimal dwt;
    private BigDecimal grt;
    private BigDecimal loa;
    private String cargoType;
    private String cargoName;
    private String cargoNameOther;
    private BigDecimal cargoQuantity;
    private String portOfCall;
    private String dischargeLoadingLocation;
    private String otherInfo;
    private String transportLs;
    private String transportQuarantine;
    private String frtTaxType;
    private BigDecimal boatHireAmount;
    private BigDecimal tallyFeeAmount;
    private String quoteForm;
    private BigDecimal berthHours;
    private BigDecimal anchorageHours;
    private BigDecimal pilotage3rdMiles;
    
    public static ShippingAgencyInquiryResponse from(ShippingAgencyInquiry inquiry) {
        return ShippingAgencyInquiryResponse.builder()
            .id(inquiry.getId())
            .userId(inquiry.getUserId())
            .status(inquiry.getStatus())
            .submittedAt(inquiry.getSubmittedAt())
            .updatedAt(inquiry.getUpdatedAt())
            .notes(inquiry.getNotes())
            .toName(inquiry.getToName())
            .mv(inquiry.getMv())
            .eta(inquiry.getEta())
            .dwt(inquiry.getDwt())
            .grt(inquiry.getGrt())
            .loa(inquiry.getLoa())
            .cargoType(inquiry.getCargoType())
            .cargoName(inquiry.getCargoName())
            .cargoNameOther(inquiry.getCargoNameOther())
            .cargoQuantity(inquiry.getCargoQuantity())
            .portOfCall(inquiry.getPortOfCall())
            .dischargeLoadingLocation(inquiry.getDischargeLoadingLocation())
            .otherInfo(inquiry.getOtherInfo())
            .transportLs(inquiry.getTransportLs())
            .transportQuarantine(inquiry.getTransportQuarantine())
            .frtTaxType(inquiry.getFrtTaxType())
            .boatHireAmount(inquiry.getBoatHireAmount())
            .tallyFeeAmount(inquiry.getTallyFeeAmount())
            .quoteForm(inquiry.getQuoteForm())
            .berthHours(inquiry.getBerthHours())
            .anchorageHours(inquiry.getAnchorageHours())
            .pilotage3rdMiles(inquiry.getPilotage3rdMiles())
            .build();
    }
}

package com.example.seatrans.features.inquiry.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PublicInquiryRequest {

    // Accept either ID or slug for flexibility
    private Long serviceTypeId;
    private String serviceTypeSlug;

    private String notes;

    private Map<String, Object> details;

    // Shipping Agency specific fields
    private String shipownerTo;
    private String vesselName;
    private BigDecimal grt;
    private BigDecimal dwt;
    private BigDecimal loa;
    private LocalDate eta;
    private String cargoType;
    private String cargoName;
    private String cargoNameOther;
    private BigDecimal quantityTons;
    private String frtTaxType;
    private String portOfCall;
    private String dischargeLoadingLocation;
    private BigDecimal boatHireAmount;
    private BigDecimal tallyFeeAmount;
    private String transportLs;
    private String transportQuarantine;

    // Chartering & Ship Broking fields
    private String cargoQuantity;
    private String loadingPort;
    private String dischargingPort;
    private LocalDate laycanFrom;
    private LocalDate laycanTo;

    // Freight Forwarding fields
    private String deliveryTerm;
    private Integer container20;
    private Integer container40;
    private LocalDate shipmentFrom;
    private LocalDate shipmentTo;

    // Special Request fields
    private String subject;
    private Long preferredProvinceId;
    private Long relatedDepartmentId;
    private String message;
}

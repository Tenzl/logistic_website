package com.example.seatrans.features.logistics.dto;

import java.math.BigDecimal;
import java.util.List;

import com.example.seatrans.features.pricing.dto.CalculationStepDTO;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Internal Quotation DTO with full breakdown
 * FOR EMPLOYEE/ADMIN USE ONLY
 * Contains confidential pricing formulas and breakdown
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuotationInternalDTO {
    private Long id;
    private String quoteCode;
    private Long requestId;
    private Long customerId;
    private String customerName;
    private Long employeeId;
    private String employeeName;
    private String serviceType;
    private String status;
    
    // FULL PRICING BREAKDOWN (INTERNAL ONLY)
    private BigDecimal basePrice;
    private BigDecimal totalSurcharges;
    private BigDecimal totalDiscounts;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal finalAmount;
    private String currency;
    
    // Price override info
    private Boolean isPriceOverridden;
    private String overrideReason;
    private BigDecimal originalCalculatedPrice;
    
    // Dates
    private String quoteDate;
    private String validUntil;
    private String sentAt;
    
    // Service data
    private Object serviceInputData;
    
    // Customer interaction
    private String customerResponse;
    private String customerResponseDate;
    private String customerNotes;
    
    // CONFIDENTIAL: Detailed breakdown
    private List<QuotationItemDTO> items;
    private List<CalculationStepDTO> calculationSteps;
    
    // Analysis
    private BigDecimal profitMargin;
    private Object costAnalysis;
    
    private String createdAt;
    private String updatedAt;
}

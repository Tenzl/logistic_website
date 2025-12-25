package com.example.seatrans.features.logistics.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Customer-facing Quotation DTO
 * ONLY contains final price - NO BREAKDOWN
 * Protects trade secrets and confidential pricing formulas
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuotationDTO {
    private Long id;
    private String quoteCode;
    private String quoteDate;
    private String validUntil;
    private String status;
    private String serviceType;
    
    // Service summary for display
    private Object serviceSummary;
    
    // ONLY final price shown to customers
    private BigDecimal finalAmount;
    private String currency;
    
    // Actions
    private String pdfUrl;
    private Boolean canAccept;
    private Boolean canReject;
    private Boolean canRequestRevision;
    
    // Customer notes
    private String customerNotes;
    private String customerResponse;
    private String customerResponseDate;
}

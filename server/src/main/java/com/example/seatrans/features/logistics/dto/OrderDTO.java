package com.example.seatrans.features.logistics.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Customer-facing Order DTO
 * Shows only final amount, no breakdown
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderDTO {
    private Long id;
    private String orderCode;
    private Long quotationId;
    private String quoteCode;
    private Long customerId;
    private String serviceType;
    
    private String orderStatus;
    private String paymentStatus;
    
    // ONLY final amount shown to customer
    private BigDecimal finalAmount;
    private BigDecimal paidAmount;
    private BigDecimal outstandingAmount;
    private String currency;
    
    // Service data
    private Object serviceData;
    private Object serviceSummary;
    
    // Dates
    private String orderDate;
    private String confirmedAt;
    private String completedAt;
    
    // Notes
    private String customerNotes;
    
    // Actions
    private String invoiceUrl;
    private Boolean canPay;
    private Boolean canCancel;
}

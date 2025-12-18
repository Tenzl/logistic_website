package com.example.seatrans.features.pricing.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * CONFIDENTIAL: Price Calculation Result
 * Contains proprietary pricing breakdown
 * FOR INTERNAL USE ONLY - Never expose to customers
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceCalculationResult {
    private BigDecimal basePrice;
    private BigDecimal totalSurcharges;
    private BigDecimal totalDiscounts;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal finalAmount;
    private String currency;
    
    @Builder.Default
    private List<PriceBreakdownItem> breakdown = new ArrayList<>();
    
    @Builder.Default
    private List<CalculationStep> calculationSteps = new ArrayList<>();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PriceBreakdownItem {
        private String itemCategory; // BASE_PRICE, SURCHARGE, DISCOUNT, TAX
        private String itemName;
        private String description;
        private BigDecimal quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private String calculationNote;
        private Integer displayOrder;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CalculationStep {
        private String calculationStep;
        private String componentName;
        private String formulaUsed;
        private String inputValues; // JSON string
        private BigDecimal baseValue;
        private BigDecimal rateApplied;
        private BigDecimal multiplier;
        private BigDecimal calculatedValue;
        private String calculationNotes;
        private Integer stepOrder;
    }
}

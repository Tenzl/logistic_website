package com.example.seatrans.features.pricing.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CalculationStepDTO {
    private Long id;
    private Long quotationId;
    private String calculationStep;
    private String componentName;
    private String formulaUsed;
    private Object inputValues;
    private BigDecimal baseValue;
    private BigDecimal rateApplied;
    private BigDecimal multiplier;
    private BigDecimal calculatedValue;
    private String currency;
    private String calculationNotes;
    private Integer stepOrder;
    private String calculatedAt;
}

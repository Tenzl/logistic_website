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
public class EstimateDTO {
    private String estimateCode;
    private String serviceType;
    private BigDecimal estimatedPrice;
    private String currency;
    private Object serviceSummary;
    private Integer validForDays;
    private String pdfDownloadUrl;
    private String note;
    private String createdDate;
    private String validUntil;
}

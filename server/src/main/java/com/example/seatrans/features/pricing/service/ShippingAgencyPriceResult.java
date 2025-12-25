package com.example.seatrans.features.pricing.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Shipping Agency Price Calculation Result
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAgencyPriceResult {
    
    private List<PriceComponent> components;
    private BigDecimal totalAmount;
    private String currency;
    
    // Vessel info
    private String port;
    private Integer dwt;
    private Integer grt;
    private Double loa;
    private Integer stayDays;
    private LocalDate arrivalDate;
    private LocalDate departureDate;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceComponent {
        private String name;
        private BigDecimal amount;
        private String description;
    }
}

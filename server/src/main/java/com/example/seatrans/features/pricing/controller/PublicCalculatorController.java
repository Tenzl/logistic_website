package com.example.seatrans.features.pricing.controller;

import com.example.seatrans.shared.dto.ApiResponse;
import com.example.seatrans.features.pricing.dto.EstimateDTO;
import com.example.seatrans.features.logistics.dto.LogisticsRequestDTO;
import com.example.seatrans.features.logistics.dto.ShippingAgencyRequestDTO;
import com.example.seatrans.features.logistics.dto.CharteringRequestDTO;
import com.example.seatrans.features.pricing.service.PriceCalculationResult;
import com.example.seatrans.features.pricing.service.PriceCalculationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Public Calculator API for Guest Users
 * Returns FINAL PRICE ONLY - No breakdown
 * Protects proprietary pricing formulas
 */
@RestController
@RequestMapping("/api/public/calculator")
@RequiredArgsConstructor
@Slf4j
public class PublicCalculatorController {
    
    private final PriceCalculationService priceCalculationService;
    
    private static final DateTimeFormatter CODE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    
    /**
     * Calculate estimate for Logistics service (Guest)
     * Returns FINAL PRICE ONLY - NO BREAKDOWN
     */
    @PostMapping("/logistics")
    public ResponseEntity<ApiResponse<EstimateDTO>> calculateLogisticsEstimate(
            @Valid @RequestBody LogisticsRequestDTO request) {
        
        log.info("Guest estimate request for Logistics: {} to {}", 
            request.getLoadingPort(), request.getDischargingPort());
        
        // Calculate price (internal use only)
        PriceCalculationResult calculation = priceCalculationService.calculateLogisticsPrice(request);
        
        // Return SANITIZED response - FINAL PRICE ONLY
        EstimateDTO estimate = EstimateDTO.builder()
            .estimateCode(generateEstimateCode())
            .serviceType("FREIGHT_FORWARDING")
            .estimatedPrice(calculation.getFinalAmount()) // ONLY FINAL PRICE
            .currency(calculation.getCurrency())
            .validForDays(7)
            .note("This is an estimate only. Register to get official quotation.")
            .build();
        
        return ResponseEntity.ok(ApiResponse.success("Estimate calculated successfully", estimate));
    }
    
    /**
     * Calculate estimate for Shipping Agency service (Guest)
     * Returns FINAL PRICE ONLY - NO BREAKDOWN
     */
    @PostMapping("/shipping-agency")
    public ResponseEntity<ApiResponse<EstimateDTO>> calculateShippingAgencyEstimate(
            @Valid @RequestBody ShippingAgencyRequestDTO request) {
        
        log.info("Guest estimate request for Shipping Agency: DWT={}, GRT={}", 
            request.getDwt(), request.getGrt());
        
        PriceCalculationResult calculation = priceCalculationService.calculateShippingAgencyPrice(request);
        
        EstimateDTO estimate = EstimateDTO.builder()
            .estimateCode(generateEstimateCode())
            .serviceType("SHIPPING_AGENCY")
            .estimatedPrice(calculation.getFinalAmount()) // ONLY FINAL PRICE
            .currency(calculation.getCurrency())
            .validForDays(7)
            .note("This is an estimate only. Register to get official quotation.")
            .build();
        
        return ResponseEntity.ok(ApiResponse.success("Estimate calculated successfully", estimate));
    }
    
    /**
     * Calculate estimate for Chartering service (Guest)
     * Returns FINAL PRICE ONLY - NO BREAKDOWN
     */
    @PostMapping("/chartering")
    public ResponseEntity<ApiResponse<EstimateDTO>> calculateCharteringEstimate(
            @Valid @RequestBody CharteringRequestDTO request) {
        
        log.info("Guest estimate request for Chartering: {} to {}", 
            request.getLoadingPort(), request.getDischargingPort());
        
        PriceCalculationResult calculation = priceCalculationService.calculateCharteringPrice(request);
        
        EstimateDTO estimate = EstimateDTO.builder()
            .estimateCode(generateEstimateCode())
            .serviceType("CHARTERING")
            .estimatedPrice(calculation.getFinalAmount()) // ONLY FINAL PRICE
            .currency(calculation.getCurrency())
            .validForDays(7)
            .note("This is an estimate only. Register to get official quotation.")
            .build();
        
        return ResponseEntity.ok(ApiResponse.success("Estimate calculated successfully", estimate));
    }
    
    private String generateEstimateCode() {
        String dateCode = LocalDateTime.now().format(CODE_FORMATTER);
        long random = System.currentTimeMillis() % 10000;
        return String.format("EST-%s-%04d", dateCode, random);
    }
}

package com.example.seatrans.features.logistics.controller;

import com.example.seatrans.shared.dto.ApiResponse;
import com.example.seatrans.features.logistics.dto.QuotationDTO;
import com.example.seatrans.features.logistics.dto.ServiceRequestDTO;
import com.example.seatrans.features.logistics.dto.LogisticsRequestDTO;
import com.example.seatrans.features.logistics.dto.ShippingAgencyRequestDTO;
import com.example.seatrans.features.logistics.dto.CharteringRequestDTO;
import com.example.seatrans.features.logistics.service.QuotationService;
import com.example.seatrans.features.logistics.service.ServiceRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Customer APIs for Requests and Quotations
 * CONFIDENTIALITY: Customers see FINAL PRICE ONLY - No breakdown
 */
@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
@Slf4j
public class CustomerRequestController {
    
    private final ServiceRequestService serviceRequestService;
    private final QuotationService quotationService;
    
    /**
     * Submit Logistics service request
     */
    @PostMapping("/requests/logistics")
    public ResponseEntity<ApiResponse<ServiceRequestDTO>> submitLogisticsRequest(
            @Valid @RequestBody LogisticsRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long customerId = getCurrentCustomerId(userDetails);
        
        ServiceRequestDTO result = serviceRequestService.createLogisticsRequest(request, customerId);
        
        return ResponseEntity.ok(ApiResponse.success("Request submitted successfully", result));
    }
    
    /**
     * Submit Shipping Agency service request
     */
    @PostMapping("/requests/shipping-agency")
    public ResponseEntity<ApiResponse<ServiceRequestDTO>> submitShippingAgencyRequest(
            @Valid @RequestBody ShippingAgencyRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long customerId = getCurrentCustomerId(userDetails);
        
        ServiceRequestDTO result = serviceRequestService.createShippingAgencyRequest(request, customerId);
        
        return ResponseEntity.ok(ApiResponse.success("Request submitted successfully", result));
    }
    
    /**
     * Submit Chartering service request
     */
    @PostMapping("/requests/chartering")
    public ResponseEntity<ApiResponse<ServiceRequestDTO>> submitCharteringRequest(
            @Valid @RequestBody CharteringRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long customerId = getCurrentCustomerId(userDetails);
        
        ServiceRequestDTO result = serviceRequestService.createCharteringRequest(request, customerId);
        
        return ResponseEntity.ok(ApiResponse.success("Request submitted successfully", result));
    }
    
    /**
     * Get customer's service requests
     */
    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<ServiceRequestDTO>>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long customerId = getCurrentCustomerId(userDetails);
        
        List<ServiceRequestDTO> requests = serviceRequestService.getCustomerRequests(customerId);
        
        return ResponseEntity.ok(ApiResponse.success("Requests retrieved successfully", requests));
    }
    
    /**
     * Get customer's quotations (SANITIZED - FINAL PRICE ONLY)
     */
    @GetMapping("/quotations")
    public ResponseEntity<ApiResponse<List<QuotationDTO>>> getMyQuotations(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long customerId = getCurrentCustomerId(userDetails);
        
        List<QuotationDTO> quotations = quotationService.getCustomerQuotations(customerId);
        
        return ResponseEntity.ok(ApiResponse.success("Quotations retrieved successfully", quotations));
    }
    
    /**
     * Get quotation details (SANITIZED - FINAL PRICE ONLY)
     */
    @GetMapping("/quotations/{id}")
    public ResponseEntity<ApiResponse<QuotationDTO>> getQuotation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long customerId = getCurrentCustomerId(userDetails);
        
        QuotationDTO quotation = quotationService.getCustomerQuotation(id, customerId);
        
        return ResponseEntity.ok(ApiResponse.success("Quotation retrieved successfully", quotation));
    }
    
    /**
     * Accept quotation
     */
    @PostMapping("/quotations/{id}/accept")
    public ResponseEntity<ApiResponse<Void>> acceptQuotation(
            @PathVariable Long id,
            @RequestBody(required = false) String notes,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long customerId = getCurrentCustomerId(userDetails);
        
        quotationService.acceptQuotation(id, customerId, notes);
        
        return ResponseEntity.ok(ApiResponse.success("Quotation accepted successfully", null));
    }
    
    /**
     * Reject quotation
     */
    @PostMapping("/quotations/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectQuotation(
            @PathVariable Long id,
            @RequestBody(required = false) String notes,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long customerId = getCurrentCustomerId(userDetails);
        
        quotationService.rejectQuotation(id, customerId, notes);
        
        return ResponseEntity.ok(ApiResponse.success("Quotation rejected", null));
    }
    
    private Long getCurrentCustomerId(UserDetails userDetails) {
        // TODO: Implement proper user ID extraction
        return 1L; // Placeholder
    }
}

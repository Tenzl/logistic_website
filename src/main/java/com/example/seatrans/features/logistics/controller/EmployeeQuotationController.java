package com.example.seatrans.features.logistics.controller;

import com.example.seatrans.shared.dto.ApiResponse;
import com.example.seatrans.features.logistics.dto.QuotationInternalDTO;
import com.example.seatrans.features.logistics.service.QuotationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Employee APIs for Quotation Management
 * INTERNAL ONLY: Full access to pricing breakdown and formulas
 * CONFIDENTIAL: Trade secret protection
 */
@RestController
@RequestMapping("/api/employee/quotations")
@PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class EmployeeQuotationController {
    
    private final QuotationService quotationService;
    
    /**
     * Generate quotation from service request
     * INTERNAL: Access to full pricing calculation
     */
    @PostMapping("/from-request/{requestId}")
    public ResponseEntity<ApiResponse<QuotationInternalDTO>> generateQuotation(
            @PathVariable Long requestId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long employeeId = getCurrentEmployeeId(userDetails);
        
        QuotationInternalDTO quotation = quotationService.generateQuotationFromRequest(requestId, employeeId);
        
        return ResponseEntity.ok(ApiResponse.success("Quotation generated successfully", quotation));
    }
    
    /**
     * Get quotation with full breakdown (INTERNAL ONLY)
     * CONFIDENTIAL: Includes pricing formulas and profit margins
     */
    @GetMapping("/{id}/internal")
    public ResponseEntity<ApiResponse<QuotationInternalDTO>> getQuotationWithBreakdown(
            @PathVariable Long id) {
        
        QuotationInternalDTO quotation = quotationService.getQuotationWithBreakdown(id);
        
        return ResponseEntity.ok(ApiResponse.success("Quotation retrieved with full breakdown", quotation));
    }
    
    /**
     * Send quotation to customer
     * Customer will receive SANITIZED version (final price only)
     */
    @PostMapping("/{id}/send")
    public ResponseEntity<ApiResponse<Void>> sendQuotation(@PathVariable Long id) {
        
        quotationService.sendQuotation(id);
        
        return ResponseEntity.ok(ApiResponse.success("Quotation sent to customer", null));
    }
    
    private Long getCurrentEmployeeId(UserDetails userDetails) {
        // TODO: Implement proper employee ID extraction
        return 1L; // Placeholder
    }
}

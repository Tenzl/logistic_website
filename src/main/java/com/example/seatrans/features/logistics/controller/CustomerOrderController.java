package com.example.seatrans.features.logistics.controller;

import com.example.seatrans.shared.dto.ApiResponse;
import com.example.seatrans.features.logistics.dto.OrderDTO;
import com.example.seatrans.features.logistics.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Customer Order Management APIs
 * Shows FINAL AMOUNT ONLY - No pricing breakdown
 */
@RestController
@RequestMapping("/api/customer/orders")
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
@Slf4j
public class CustomerOrderController {
    
    private final OrderService orderService;
    
    /**
     * Get customer's orders
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long customerId = getCurrentCustomerId(userDetails);
        
        List<OrderDTO> orders = orderService.getCustomerOrders(customerId);
        
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }
    
    /**
     * Get order details (FINAL AMOUNT ONLY)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long customerId = getCurrentCustomerId(userDetails);
        
        OrderDTO order = orderService.getCustomerOrder(id, customerId);
        
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
    }
    
    private Long getCurrentCustomerId(UserDetails userDetails) {
        // TODO: Implement proper user ID extraction
        return 1L; // Placeholder
    }
}

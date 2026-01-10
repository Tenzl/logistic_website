package com.example.seatrans.features.customer.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.seatrans.features.customer.model.enums.CustomerType;
import com.example.seatrans.features.customer.model.enums.MembershipLevel;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho Customer
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {
    
    private Long id;
    private Long userId;
    private String customerCode;
    
    @Size(max = 200, message = "Company name must not exceed 200 characters")
    private String companyName;
    
    @Size(max = 50, message = "Tax code must not exceed 50 characters")
    private String taxCode;
    
    @NotNull(message = "Customer type is required")
    private CustomerType customerType;
    
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;
    
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;
    
    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;
    
    @Size(max = 20, message = "Postal code must not exceed 20 characters")
    private String postalCode;
    
    @Min(value = 0, message = "Loyalty points cannot be negative")
    private Integer loyaltyPoints;
    
    private MembershipLevel membershipLevel;
    
    @DecimalMin(value = "0.0", message = "Credit limit cannot be negative")
    private BigDecimal creditLimit;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // User basic info (nested)
    private String email;
    private String fullName;
    private String phone;
    private Boolean isActive;
}





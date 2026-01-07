package com.example.seatrans.features.auth.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho Employee
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {
    
    private Long id;
    private Long userId;
    private String employeeCode;
    
    @Size(max = 100, message = "Position must not exceed 100 characters")
    private String position;
    
    @NotNull(message = "Hire date is required")
    @PastOrPresent(message = "Hire date cannot be in the future")
    private LocalDate hireDate;
    
    @DecimalMin(value = "0.0", message = "Salary cannot be negative")
    private BigDecimal salary;
    
    @DecimalMin(value = "0.0", message = "Commission rate cannot be negative")
    @DecimalMax(value = "100.0", message = "Commission rate cannot exceed 100%")
    private BigDecimal commissionRate;
    
    private Long managerId;
    private String managerName;  // Manager's full name
    private String managerCode;  // Manager's employee code
    
    private Boolean isActive;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // User basic info (nested)
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private Boolean userIsActive;
    
    // Calculated fields
    private Integer yearsOfService;
    private Boolean isManager;
    private Integer subordinatesCount;
}



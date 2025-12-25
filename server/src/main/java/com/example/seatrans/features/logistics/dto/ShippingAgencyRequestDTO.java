package com.example.seatrans.features.logistics.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Shipping Agency Request DTO
 * For PORT D/A INQUIRY - Port Disbursement Account
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAgencyRequestDTO {
    
    // Contact Information
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Phone/Fax/Mobile or E-mail is required")
    private String contactInfo;
    
    // Vessel Information
    @NotNull(message = "DWT is required")
    @Min(value = 1, message = "DWT must be at least 1")
    @Max(value = 500000, message = "DWT cannot exceed 500,000")
    private Integer dwt;
    
    @NotNull(message = "GRT is required")
    @Min(value = 1, message = "GRT must be at least 1")
    @Max(value = 500000, message = "GRT cannot exceed 500,000")
    private Integer grt;
    
    @NotNull(message = "LOA is required")
    @DecimalMin(value = "10.0", message = "LOA must be at least 10 meters")
    @DecimalMax(value = "400.0", message = "LOA cannot exceed 400 meters")
    private Double loa;
    
    @NotBlank(message = "Cargo/Quantity is required")
    private String cargoQuantity;
    
    @NotBlank(message = "Port of call is required")
    private String portOfCall;  // "HAIPHONG" or "HOCHIMINH"
    
    @NotNull(message = "Arrival date is required")
    private LocalDate arrivalDate;
    
    @NotNull(message = "Departure date is required")
    private LocalDate departureDate;
    
    // Optional
    private String otherInformation;
}


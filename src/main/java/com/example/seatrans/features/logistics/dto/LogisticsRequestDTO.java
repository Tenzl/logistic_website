package com.example.seatrans.features.logistics.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogisticsRequestDTO {
    @NotBlank(message = "Cargo name is required")
    private String cargoName;
    
    @NotBlank(message = "Delivery term is required")
    private String deliveryTerm;
    
    @Min(value = 0, message = "Container 20' must be non-negative")
    private Integer container20;
    
    @Min(value = 0, message = "Container 40' must be non-negative")
    private Integer container40;
    
    @NotBlank(message = "Loading port is required")
    private String loadingPort;
    
    @NotBlank(message = "Discharging port is required")
    private String dischargingPort;
    
    private String shipmentDateFrom;
    private String shipmentDateTo;
    
    private String cargoDescription;
    private String hsCode;
    private Boolean insuranceRequired;
    private String incoterm;
    private String containerType;
    private String specialRequirements;
    
    // For service request creation
    private String fullName;
    private String contactInfo;
    private String otherInformation;
}

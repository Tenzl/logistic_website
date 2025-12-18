package com.example.seatrans.features.logistics.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CharteringRequestDTO {
    @NotBlank(message = "Cargo quantity is required")
    private String cargoQuantity;
    
    @NotBlank(message = "Loading port is required")
    private String loadingPort;
    
    @NotBlank(message = "Discharging port is required")
    private String dischargingPort;
    
    @NotBlank(message = "LAY CAN from date is required")
    private String laycanFrom;
    
    @NotBlank(message = "LAY CAN to date is required")
    private String laycanTo;
    
    private String charterType; // VOYAGE, TIME, BAREBOAT
    private String cargoType; // BULK, CONTAINER, LIQUID, etc.
    private String specialRequirements;
    
    // For service request creation
    private String fullName;
    private String contactInfo;
    private String otherInformation;
}

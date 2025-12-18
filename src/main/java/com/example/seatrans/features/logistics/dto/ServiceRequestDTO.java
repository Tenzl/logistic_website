package com.example.seatrans.features.logistics.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ServiceRequestDTO {
    private Long id;
    private String requestCode;
    private Long customerId;
    private String serviceType;
    private String requestStatus;
    
    private String fullName;
    private String contactInfo;
    private String otherInformation;
    
    // Service-specific data (JSON string or parsed object)
    private Object serviceData;
    
    private String submittedAt;
    private String quotedAt;
    private String expiresAt;
    private String createdAt;
    private String updatedAt;
}

package com.example.seatrans.features.gallery.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating gallery image
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateImageRequest {
    
    @NotNull(message = "Service type is required")
    private String serviceType;
    
    @NotNull(message = "Image type is required")
    private String imageType;
    
    private String province;
    
    private String port;
}

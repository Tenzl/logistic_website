package com.example.seatrans.features.gallery.dto;

import jakarta.validation.constraints.NotBlank;
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

    @NotNull(message = "Image URL is required")
    private String imageUrl;

    @NotNull(message = "Service type ID is required")
    private Long serviceTypeId;

    @NotNull(message = "Image type ID is required")
    private Long imageTypeId;

    @NotNull(message = "Province ID is required")
    private Long provinceId;

    @NotNull(message = "Port ID is required")
    private Long portId;
}

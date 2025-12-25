package com.example.seatrans.features.gallery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating gallery image
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateImageRequest {
    private Long provinceId;
    private Long portId;
    private Long serviceTypeId;
    private Long imageTypeId;
}

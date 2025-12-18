package com.example.seatrans.features.gallery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for image count by image type
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageCountDTO {
    private Long imageTypeId;
    private Integer current;
    private Integer required;
    private Boolean isExceeded;
    private Boolean isBelow;

    public static ImageCountDTO of(Integer current, Integer required) {
        return ImageCountDTO.builder()
                .current(current)
                .required(required)
                .isExceeded(current > required)
                .isBelow(current < required)
                .build();
    }
}

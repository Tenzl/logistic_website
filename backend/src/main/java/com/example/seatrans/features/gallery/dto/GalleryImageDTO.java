package com.example.seatrans.features.gallery.dto;

import java.time.LocalDateTime;

import com.example.seatrans.features.ports.dto.PortDTO;
import com.example.seatrans.features.provinces.dto.ProvinceDTO;
import com.example.seatrans.features.logistics.dto.ServiceTypeDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Gallery Image
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryImageDTO {
    private Long id;
    private ServiceTypeDTO serviceType;
    private ImageTypeDTO imageType;
    private ProvinceDTO province;
    private PortDTO port;
    private LocalDateTime uploadedAt;
    private Long uploadedById;
    private String imageUrl;
    private String cloudinaryPublicId;
}

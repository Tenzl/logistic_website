package com.example.seatrans.features.gallery.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.seatrans.features.gallery.dto.ImageCountDTO;
import com.example.seatrans.features.gallery.dto.ImageTypeDTO;
import com.example.seatrans.features.gallery.model.ImageTypeEntity;
import com.example.seatrans.features.gallery.repository.GalleryImageRepository;
import com.example.seatrans.features.gallery.repository.ImageTypeRepository;

import lombok.RequiredArgsConstructor;

/**
 * Public Service for Image Type retrieval
 * Handles public read-only operations
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ImageTypePublicService {

    private final ImageTypeRepository imageTypeRepository;
    private final GalleryImageRepository galleryImageRepository;

    public List<ImageTypeDTO> getActiveImageTypes() {
        return imageTypeRepository.findByIsActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ImageTypeDTO> getImageTypesByServiceType(Long serviceTypeId) {
        return imageTypeRepository.findByServiceTypeIdAndIsActiveTrue(serviceTypeId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ImageTypeDTO> searchImageTypes(String searchQuery) {
        if (searchQuery == null || searchQuery.trim().isEmpty()) {
            return getActiveImageTypes();
        }
        return imageTypeRepository.findByNameContainingIgnoreCase(searchQuery)
                .stream()
                .filter(ImageTypeEntity::getIsActive)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ImageTypeDTO> searchImageTypesByServiceType(Long serviceTypeId, String searchQuery) {
        List<ImageTypeEntity> imageTypes;
        if (searchQuery == null || searchQuery.trim().isEmpty()) {
            imageTypes = imageTypeRepository.findByServiceTypeIdAndIsActiveTrue(serviceTypeId);
        } else {
            imageTypes = imageTypeRepository.findByNameContainingIgnoreCase(searchQuery)
                    .stream()
                    .filter(it -> it.getServiceType().getId().equals(serviceTypeId) && it.getIsActive())
                    .collect(Collectors.toList());
        }
        return imageTypes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ImageCountDTO getImageCount(Long imageTypeId) {
        Optional<ImageTypeEntity> imageTypeOpt = imageTypeRepository.findById(imageTypeId);
        if (!imageTypeOpt.isPresent()) {
            return ImageCountDTO.builder()
                    .current(0)
                    .required(18)
                    .isExceeded(false)
                    .isBelow(true)
                    .build();
        }

        ImageTypeEntity imageType = imageTypeOpt.get();
        long count = galleryImageRepository.findByImageType(imageType).size();
        int required = imageType.getRequiredImageCount() != null ? imageType.getRequiredImageCount() : 18;

        return ImageCountDTO.builder()
                .imageTypeId(imageTypeId)
                .current((int) count)
                .required(required)
                .isExceeded((int) count > required)
                .isBelow((int) count < required)
                .build();
    }

    public ImageCountDTO getImageCount(Long provinceId, Long portId, Long serviceTypeId, Long imageTypeId) {
        Optional<ImageTypeEntity> imageTypeOpt = imageTypeRepository.findById(imageTypeId);
        if (!imageTypeOpt.isPresent()) {
            return ImageCountDTO.builder()
                    .current(0)
                    .required(18)
                    .isExceeded(false)
                    .isBelow(true)
                    .build();
        }

        ImageTypeEntity imageType = imageTypeOpt.get();
        long count = galleryImageRepository.countByProvinceIdAndPortIdAndServiceTypeIdAndImageTypeId(
                provinceId, portId, serviceTypeId, imageTypeId);
        int required = imageType.getRequiredImageCount() != null ? imageType.getRequiredImageCount() : 18;

        return ImageCountDTO.builder()
                .imageTypeId(imageTypeId)
                .current((int) count)
                .required(required)
                .isExceeded((int) count > required)
                .isBelow((int) count < required)
                .build();
    }

    private ImageTypeDTO convertToDTO(ImageTypeEntity imageType) {
        String serviceTypeName = imageType.getServiceType() != null ? imageType.getServiceType().getName() : "";
        return new ImageTypeDTO(
                imageType.getId(),
                imageType.getServiceType() != null ? imageType.getServiceType().getId() : null,
                serviceTypeName,
                imageType.getName(),
                imageType.getDisplayName(),
                imageType.getDescription(),
                imageType.getRequiredImageCount(),
                imageType.getIsActive()
        );
    }
}

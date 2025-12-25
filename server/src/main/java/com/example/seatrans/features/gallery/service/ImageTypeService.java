package com.example.seatrans.features.gallery.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.seatrans.features.gallery.dto.CreateImageTypeRequest;
import com.example.seatrans.features.gallery.dto.ImageCountDTO;
import com.example.seatrans.features.gallery.dto.ImageTypeDTO;
import com.example.seatrans.features.gallery.model.ImageTypeEntity;
import com.example.seatrans.features.gallery.repository.GalleryImageRepository;
import com.example.seatrans.features.gallery.repository.ImageTypeRepository;
import com.example.seatrans.features.logistics.model.ServiceTypeEntity;
import com.example.seatrans.features.logistics.repository.ServiceTypeRepository;

@Service
public class ImageTypeService {

    @Autowired
    private ImageTypeRepository imageTypeRepository;

    @Autowired
    private ServiceTypeRepository serviceTypeRepository;

    @Autowired
    private GalleryImageRepository galleryImageRepository;

    public List<ImageTypeDTO> getAllImageTypes() {
        return imageTypeRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

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

    public ImageTypeDTO getImageTypeById(Long id) {
        return imageTypeRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public ImageTypeDTO createImageType(CreateImageTypeRequest request) {
        // Check if service type exists
        Optional<ServiceTypeEntity> serviceTypeOpt = serviceTypeRepository.findById(request.getServiceTypeId());
        if (serviceTypeOpt.isEmpty()) {
            return null;
        }

        // Check if image type already exists for this service type
        Optional<ImageTypeEntity> existing = imageTypeRepository.findByNameAndServiceTypeId(
                request.getName(),
                request.getServiceTypeId()
        );
        if (existing.isPresent()) {
            return convertToDTO(existing.get());
        }

        ImageTypeEntity imageType = new ImageTypeEntity();
        imageType.setServiceType(serviceTypeOpt.get());
        imageType.setName(request.getName());
        imageType.setDisplayName(request.getDisplayName());
        imageType.setDescription(request.getDescription());
        imageType.setRequiredImageCount(request.getRequiredImageCount() != null ? request.getRequiredImageCount() : 18);
        imageType.setIsActive(true);

        ImageTypeEntity savedImageType = imageTypeRepository.save(imageType);
        return convertToDTO(savedImageType);
    }

    public ImageTypeDTO updateImageType(Long id, CreateImageTypeRequest request) {
        Optional<ImageTypeEntity> existingOpt = imageTypeRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return null;
        }

        Optional<ServiceTypeEntity> serviceTypeOpt = serviceTypeRepository.findById(request.getServiceTypeId());
        if (serviceTypeOpt.isEmpty()) {
            return null;
        }

        ImageTypeEntity imageType = existingOpt.get();
        imageType.setServiceType(serviceTypeOpt.get());
        imageType.setName(request.getName());
        imageType.setDisplayName(request.getDisplayName());
        imageType.setDescription(request.getDescription());
        if (request.getRequiredImageCount() != null) {
            imageType.setRequiredImageCount(request.getRequiredImageCount());
        }

        ImageTypeEntity updatedImageType = imageTypeRepository.save(imageType);
        return convertToDTO(updatedImageType);
    }

    public void deleteImageType(Long id) {
        imageTypeRepository.deleteById(id);
    }

    public long getImageTypeCount() {
        return imageTypeRepository.count();
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
}

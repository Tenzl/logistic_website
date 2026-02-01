package com.example.seatrans.features.gallery.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.seatrans.features.gallery.dto.CreateImageTypeRequest;
import com.example.seatrans.features.gallery.dto.ImageTypeDTO;
import com.example.seatrans.features.gallery.model.ImageTypeEntity;
import com.example.seatrans.features.gallery.repository.ImageTypeRepository;
import com.example.seatrans.features.logistics.model.ServiceTypeEntity;
import com.example.seatrans.features.logistics.repository.ServiceTypeRepository;
import com.example.seatrans.shared.mapper.EntityMapper;

import lombok.RequiredArgsConstructor;

/**
 * Admin Service for Image Type management
 * Handles admin-only CRUD operations
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ImageTypeAdminService {

    private final ImageTypeRepository imageTypeRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final EntityMapper entityMapper;

    public List<ImageTypeDTO> getAllImageTypes() {
        return imageTypeRepository.findAll()
                .stream()
                .map(entityMapper::toImageTypeDTO)
                .collect(Collectors.toList());
    }

    public ImageTypeDTO getImageTypeById(Long id) {
        return imageTypeRepository.findById(id)
                .map(entityMapper::toImageTypeDTO)
                .orElse(null);
    }

    public ImageTypeDTO createImageType(CreateImageTypeRequest request) {
        Optional<ServiceTypeEntity> serviceTypeOpt = serviceTypeRepository.findById(request.getServiceTypeId());
        if (serviceTypeOpt.isEmpty()) {
            return null;
        }

        Optional<ImageTypeEntity> existing = imageTypeRepository.findByNameAndServiceTypeId(
                request.getName(),
                request.getServiceTypeId()
        );
        if (existing.isPresent()) {
            return entityMapper.toImageTypeDTO(existing.get());
        }

        ImageTypeEntity imageType = new ImageTypeEntity();
        imageType.setServiceType(serviceTypeOpt.get());
        imageType.setName(request.getName());
        imageType.setDisplayName(request.getDisplayName());
        imageType.setDescription(request.getDescription());
        imageType.setRequiredImageCount(request.getRequiredImageCount() != null ? request.getRequiredImageCount() : 18);
        imageType.setIsActive(true);

        ImageTypeEntity savedImageType = imageTypeRepository.save(imageType);
        return entityMapper.toImageTypeDTO(savedImageType);
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
        return entityMapper.toImageTypeDTO(updatedImageType);
    }

    public void deleteImageType(Long id) {
        imageTypeRepository.deleteById(id);
    }

    public long getImageTypeCount() {
        return imageTypeRepository.count();
    }
}

package com.example.seatrans.features.gallery.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;

import com.example.seatrans.features.gallery.dto.GalleryImageDTO;
import com.example.seatrans.features.gallery.model.GalleryImage;
import com.example.seatrans.features.gallery.model.ImageTypeEntity;
import com.example.seatrans.features.logistics.model.ServiceTypeEntity;
import com.example.seatrans.shared.mapper.EntityMapper;
import com.example.seatrans.features.gallery.repository.GalleryImageRepository;
import com.example.seatrans.features.gallery.repository.ImageTypeRepository;
import com.example.seatrans.features.logistics.repository.ServiceTypeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Public Service for Gallery Image retrieval
 * Handles public read-only operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GalleryImagePublicService {
    
    private final GalleryImageRepository galleryImageRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final ImageTypeRepository imageTypeRepository;
    private final EntityMapper entityMapper;
    
    /**
     * Get all images with ID filters (paginated) - Public version
     */
    public Page<GalleryImageDTO> getAllImages(Long provinceId, Long portId, Long serviceTypeId, Long imageTypeId, Pageable pageable) {
        Page<GalleryImage> images = galleryImageRepository.findAll((Specification<GalleryImage>) (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (provinceId != null) {
                predicates.add(cb.equal(root.get("province").get("id"), provinceId));
            }
            if (portId != null) {
                predicates.add(cb.equal(root.get("port").get("id"), portId));
            }
            if (serviceTypeId != null) {
                predicates.add(cb.equal(root.get("serviceType").get("id"), serviceTypeId));
            }
            if (imageTypeId != null) {
                predicates.add(cb.equal(root.get("imageType").get("id"), imageTypeId));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);
        
        List<GalleryImageDTO> content = images.getContent().stream()
            .map(entityMapper::toGalleryImageDTO)
            .toList();
        return new PageImpl<>(content, pageable, images.getTotalElements());
    }

    /**
     * Get all images with optional filters (paginated)
     * @deprecated Use getAllImages with IDs instead
     */
    public Page<GalleryImageDTO> getAllImages(String serviceType, String imageType, Pageable pageable) {
        Page<GalleryImage> images;
        
        if (serviceType != null && imageType != null) {
            ServiceTypeEntity service = serviceTypeRepository.findByName(serviceType)
                    .orElseThrow(() -> new RuntimeException("Service type not found: " + serviceType));
            ImageTypeEntity type = imageTypeRepository.findByName(imageType)
                    .orElseThrow(() -> new RuntimeException("Image type not found: " + imageType));
            images = galleryImageRepository.findByServiceTypeAndImageType(service, type, pageable);
        } else if (serviceType != null) {
            ServiceTypeEntity service = serviceTypeRepository.findByName(serviceType)
                    .orElseThrow(() -> new RuntimeException("Service type not found: " + serviceType));
            images = galleryImageRepository.findByServiceType(service, pageable);
        } else if (imageType != null) {
            ImageTypeEntity type = imageTypeRepository.findByName(imageType)
                    .orElseThrow(() -> new RuntimeException("Image type not found: " + imageType));
            images = galleryImageRepository.findByImageType(type, pageable);
        } else {
            images = galleryImageRepository.findAll(pageable);
        }
        
        List<GalleryImageDTO> content = images.getContent().stream()
            .map(entityMapper::toGalleryImageDTO)
            .toList();
        return new PageImpl<>(content, pageable, images.getTotalElements());
    }
    
    /**
     * Get all images without pagination (for public home page)
     */
    public List<GalleryImageDTO> getAllImagesNoPagination() {
        List<GalleryImage> images = galleryImageRepository.findAll();
        return images.stream()
                .map(entityMapper::toGalleryImageDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get gallery images for frontend (ordered by uploadedAt)
     */
    public List<GalleryImageDTO> getGalleryImages(String serviceType, String imageType) {
        ServiceTypeEntity service = serviceTypeRepository.findByName(serviceType)
                .orElseThrow(() -> new RuntimeException("Service type not found: " + serviceType));
        ImageTypeEntity type = imageTypeRepository.findByName(imageType)
                .orElseThrow(() -> new RuntimeException("Image type not found: " + imageType));
        
        List<GalleryImage> images = galleryImageRepository.findByServiceTypeAndImageTypeOrderByUploadedAtDesc(
                service, type
        );
        
        return images.stream()
                .map(entityMapper::toGalleryImageDTO)
                .collect(Collectors.toList());
    }
}
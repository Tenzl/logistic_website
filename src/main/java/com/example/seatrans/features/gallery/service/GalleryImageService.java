package com.example.seatrans.features.gallery.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;

import com.example.seatrans.features.gallery.dto.CreateImageRequest;
import com.example.seatrans.features.gallery.dto.GalleryImageDTO;
import com.example.seatrans.features.gallery.dto.UpdateImageRequest;
import com.example.seatrans.features.gallery.model.GalleryImage;
import com.example.seatrans.features.gallery.model.ImageTypeEntity;
import com.example.seatrans.features.logistics.model.Port;
import com.example.seatrans.features.logistics.model.Province;
import com.example.seatrans.features.logistics.model.ServiceTypeEntity;
import com.example.seatrans.shared.mapper.EntityMapper;
import com.example.seatrans.features.gallery.repository.GalleryImageRepository;
import com.example.seatrans.features.gallery.repository.ImageTypeRepository;
import com.example.seatrans.features.logistics.repository.PortRepository;
import com.example.seatrans.features.logistics.repository.ProvinceRepository;
import com.example.seatrans.features.logistics.repository.ServiceTypeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for Gallery Image management
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GalleryImageService {
    
    private final GalleryImageRepository galleryImageRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final ImageTypeRepository imageTypeRepository;
    private final ProvinceRepository provinceRepository;
    private final PortRepository portRepository;
    private final EntityMapper entityMapper;
    
    /**
     * Check if image with same hash AND location already exists
     */
    public boolean checkDuplicateImage(String fileHash, Long provinceId, Long portId, Long serviceTypeId, Long imageTypeId) {
        return galleryImageRepository.findAll().stream()
            .anyMatch(image -> 
                image.getImageUrl() != null && 
                image.getImageUrl().contains(fileHash) &&
                image.getProvince() != null && image.getProvince().getId().equals(provinceId) &&
                image.getPort() != null && image.getPort().getId().equals(portId) &&
                image.getServiceType() != null && image.getServiceType().getId().equals(serviceTypeId) &&
                image.getImageType() != null && image.getImageType().getId().equals(imageTypeId)
            );
    }
    
    /**
     * Check if image with this hash already exists in database
     * @deprecated Use checkDuplicateImage with location parameters instead
     */
    @Deprecated
    public boolean checkFileExists(String fileHash) {
        // Check if any image URL contains this file hash
        return galleryImageRepository.findAll().stream()
            .anyMatch(image -> image.getImageUrl() != null && 
                      image.getImageUrl().contains(fileHash));
    }
    
    /**
     * Upload new gallery image
     */
    @SuppressWarnings("null")
    public GalleryImageDTO uploadImage(String imageUrl, Long provinceId, Long portId, 
                                       Long serviceTypeId, Long imageTypeId, Long uploadedById) {
        // Fetch entities from repositories
        ServiceTypeEntity serviceType = serviceTypeRepository.findById(serviceTypeId)
                .orElseThrow(() -> new RuntimeException("Service type not found: " + serviceTypeId));
        
        ImageTypeEntity imageType = imageTypeRepository.findById(imageTypeId)
                .orElseThrow(() -> new RuntimeException("Image type not found: " + imageTypeId));

        Province province = provinceRepository.findById(provinceId)
                .orElseThrow(() -> new RuntimeException("Province not found: " + provinceId));

        Port port = portRepository.findById(portId)
                .orElseThrow(() -> new RuntimeException("Port not found: " + portId));
        
        // Create and save image
        GalleryImage galleryImage = GalleryImage.builder()
                .serviceType(serviceType)
                .imageType(imageType)
                .province(province)
                .port(port)
                .uploadedById(uploadedById)
                .imageUrl(imageUrl)
                .build();
        
        GalleryImage saved = galleryImageRepository.save(galleryImage);
        log.info("Image uploaded successfully. ID: {}, Service: {}, Type: {}", saved.getId(), serviceType.getName(), imageType.getName());
        
        return entityMapper.toGalleryImageDTO(saved);
    }

    /**
     * Upload new gallery image (legacy version, kept for compatibility)
     */
    public GalleryImageDTO uploadImage(String imageUrl, CreateImageRequest request, Long uploadedById) {
        // Fetch entities from repositories
        ServiceTypeEntity serviceType = serviceTypeRepository.findByName(request.getServiceType())
                .orElseThrow(() -> new RuntimeException("Service type not found: " + request.getServiceType()));
        
        ImageTypeEntity imageType = imageTypeRepository.findByName(request.getImageType())
                .orElseThrow(() -> new RuntimeException("Image type not found: " + request.getImageType()));
        
        // Create and save image
        GalleryImage galleryImage = GalleryImage.builder()
                .serviceType(serviceType)
                .imageType(imageType)
                .province(request.getProvince() != null ? provinceRepository.findByName(request.getProvince()).orElse(null) : null)
                .port(request.getPort() != null ? portRepository.findByName(request.getPort()).orElse(null) : null)
                .uploadedById(uploadedById)
                .imageUrl(imageUrl)
                .build();
        
        GalleryImage saved = galleryImageRepository.save(galleryImage);
        log.info("Image uploaded successfully. ID: {}, Service: {}, Type: {}", saved.getId(), serviceType.getName(), imageType.getName());
        
        return entityMapper.toGalleryImageDTO(saved);
    }
    
    /**
     * Get all images with ID filters (paginated)
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
        
        return images.map(entityMapper::toGalleryImageDTO);
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
        
        return images.map(entityMapper::toGalleryImageDTO);
    }
    
    /**
     * Get image by ID
     */
    public GalleryImageDTO getImageById(Long id) {
        GalleryImage image = galleryImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found with ID: " + id));
        return entityMapper.toGalleryImageDTO(image);
    }
    
    /**
     * Update image
     */
    public GalleryImageDTO updateImage(Long id, UpdateImageRequest request) {
        GalleryImage image = galleryImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found with ID: " + id));
        
        java.util.Optional.ofNullable(request.getProvinceId()).ifPresent(provinceId -> {
            Province province = provinceRepository.findById(provinceId)
                .orElseThrow(() -> new RuntimeException("Province not found: " + provinceId));
            image.setProvince(province);
        });

        java.util.Optional.ofNullable(request.getPortId()).ifPresent(portId -> {
            Port port = portRepository.findById(portId)
                .orElseThrow(() -> new RuntimeException("Port not found: " + portId));
            image.setPort(port);
        });

        java.util.Optional.ofNullable(request.getServiceTypeId()).ifPresent(serviceTypeId -> {
            ServiceTypeEntity serviceType = serviceTypeRepository.findById(serviceTypeId)
                .orElseThrow(() -> new RuntimeException("Service type not found: " + serviceTypeId));
            image.setServiceType(serviceType);
        });

        java.util.Optional.ofNullable(request.getImageTypeId()).ifPresent(imageTypeId -> {
            ImageTypeEntity imageType = imageTypeRepository.findById(imageTypeId)
                .orElseThrow(() -> new RuntimeException("Image type not found: " + imageTypeId));
            image.setImageType(imageType);
        });
        
        GalleryImage updated = galleryImageRepository.save(image);
        log.info("Image updated successfully. ID: {}", id);
        
        return entityMapper.toGalleryImageDTO(updated);
    }
    
    /**
     * Delete image
     */
    public void deleteImage(Long id) {
        GalleryImage image = galleryImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found with ID: " + id));
        
        galleryImageRepository.delete(image);
        log.info("Image deleted successfully. ID: {}", id);
    }
    
    /**
     * Get all images without pagination (for admin management)
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


package com.example.seatrans.features.gallery.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.seatrans.features.gallery.dto.GalleryImageDTO;
import com.example.seatrans.features.gallery.dto.UpdateImageRequest;
import com.example.seatrans.features.gallery.model.GalleryImage;
import com.example.seatrans.features.gallery.model.ImageTypeEntity;
import com.example.seatrans.features.gallery.repository.GalleryImageRepository;
import com.example.seatrans.features.gallery.repository.ImageTypeRepository;
import com.example.seatrans.features.logistics.model.ServiceTypeEntity;
import com.example.seatrans.features.logistics.repository.ServiceTypeRepository;
import com.example.seatrans.features.ports.model.Port;
import com.example.seatrans.features.ports.repository.PortRepository;
import com.example.seatrans.features.provinces.model.Province;
import com.example.seatrans.features.provinces.repository.ProvinceRepository;
import com.example.seatrans.shared.mapper.EntityMapper;
import com.example.seatrans.shared.service.CloudinaryService;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Admin Service for Gallery Image management
 * Handles admin-only operations: upload, update, delete
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GalleryImageAdminService {

    private final GalleryImageRepository galleryImageRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final ImageTypeRepository imageTypeRepository;
    private final ProvinceRepository provinceRepository;
    private final PortRepository portRepository;
    private final EntityMapper entityMapper;
    private final CloudinaryService cloudinaryService;

    /**
     * Check if image with same hash AND location already exists
     */
    public boolean checkDuplicateImage(String fileHash, Long provinceId, Long portId, Long serviceTypeId,
            Long imageTypeId) {
        return galleryImageRepository.findAll().stream()
                .anyMatch(image -> image.getImageUrl() != null &&
                        image.getImageUrl().contains(fileHash) &&
                        image.getProvince() != null && image.getProvince().getId().equals(provinceId) &&
                        image.getPort() != null && image.getPort().getId().equals(portId) &&
                        image.getServiceType() != null && image.getServiceType().getId().equals(serviceTypeId) &&
                        image.getImageType() != null && image.getImageType().getId().equals(imageTypeId));
    }

    /**
     * Check if image with this hash already exists in database
     * 
     * @deprecated Use checkDuplicateImage with location parameters instead
     */
    @Deprecated
    public boolean checkFileExists(String fileHash) {
        return galleryImageRepository.findAll().stream()
                .anyMatch(image -> image.getImageUrl() != null &&
                        image.getImageUrl().contains(fileHash));
    }

    /**
     * Upload new gallery image with Cloudinary public ID
     */
    @SuppressWarnings("null")
    public GalleryImageDTO uploadImage(String imageUrl, String cloudinaryPublicId, Long provinceId, Long portId,
            Long serviceTypeId, Long imageTypeId, Long uploadedById) {
        ServiceTypeEntity serviceType = serviceTypeRepository.findById(serviceTypeId)
                .orElseThrow(() -> new RuntimeException("Service type not found: " + serviceTypeId));

        ImageTypeEntity imageType = imageTypeRepository.findById(imageTypeId)
                .orElseThrow(() -> new RuntimeException("Image type not found: " + imageTypeId));

        Province province = provinceRepository.findById(provinceId)
                .orElseThrow(() -> new RuntimeException("Province not found: " + provinceId));

        Port port = portRepository.findById(portId)
                .orElseThrow(() -> new RuntimeException("Port not found: " + portId));

        GalleryImage galleryImage = GalleryImage.builder()
                .serviceType(serviceType)
                .imageType(imageType)
                .province(province)
                .port(port)
                .uploadedById(uploadedById)
                .imageUrl(imageUrl)
                .cloudinaryPublicId(cloudinaryPublicId)
                .build();

        GalleryImage saved = galleryImageRepository.save(galleryImage);
        log.info("Image uploaded successfully. ID: {}, Service: {}, Type: {}, Cloudinary ID: {}", 
                saved.getId(), serviceType.getName(), imageType.getName(), cloudinaryPublicId);

        return entityMapper.toGalleryImageDTO(saved);
    }

    /**
     * Upload new gallery image (legacy method for URL-only saves)
     */
    @SuppressWarnings("null")
    public GalleryImageDTO uploadImage(String imageUrl, Long provinceId, Long portId,
            Long serviceTypeId, Long imageTypeId, Long uploadedById) {
        return uploadImage(imageUrl, null, provinceId, portId, serviceTypeId, imageTypeId, uploadedById);
    }

    /**
     * Get all images with ID filters (paginated) - Admin version
     */
    public Page<GalleryImageDTO> getAllImages(Long provinceId, Long portId, Long serviceTypeId, Long imageTypeId,
            Pageable pageable) {
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
     * Get all images without pagination (for admin management)
     */
    public List<GalleryImageDTO> getAllImagesNoPagination() {
        List<GalleryImage> images = galleryImageRepository.findAll();
        return images.stream()
                .map(entityMapper::toGalleryImageDTO)
                .toList();
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
     * Delete image (also deletes from Cloudinary if public ID exists)
     */
    public void deleteImage(Long id) {
        GalleryImage image = galleryImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found with ID: " + id));

        // Delete from Cloudinary if public ID exists
        if (image.getCloudinaryPublicId() != null && !image.getCloudinaryPublicId().isEmpty()) {
            boolean deleted = cloudinaryService.deleteFile(image.getCloudinaryPublicId());
            if (deleted) {
                log.info("Deleted image from Cloudinary: {}", image.getCloudinaryPublicId());
            } else {
                log.warn("Failed to delete image from Cloudinary: {}", image.getCloudinaryPublicId());
            }
        }

        galleryImageRepository.delete(image);
        log.info("Image deleted successfully from database. ID: {}", id);
    }
}

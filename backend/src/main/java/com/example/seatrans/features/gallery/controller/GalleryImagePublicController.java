package com.example.seatrans.features.gallery.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.gallery.dto.GalleryImageDTO;
import com.example.seatrans.features.gallery.service.GalleryImagePublicService;
import com.example.seatrans.shared.dto.ApiResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Public API Controller for Gallery Images
 * Accessible by all users (no role required)
 */
@RestController
@RequestMapping("/api/v1/gallery")
@RequiredArgsConstructor
@Slf4j
public class GalleryImagePublicController {
    
    private final GalleryImagePublicService galleryImageService;
    
    /**
     * Get paginated gallery images with filters
     * GET /api/v1/gallery/page-image?serviceTypeId=1&imageTypeId=2&page=0&size=100
     * Public endpoint for frontend service pages
     */
    @GetMapping("/page-image")
    public ResponseEntity<ApiResponse<PagedGalleryResponse>> getGalleryImages(
            @RequestParam(required = false) Long serviceTypeId,
            @RequestParam(required = false) Long imageTypeId,
            @RequestParam(required = false) Long portId,
            @RequestParam(required = false) Long provinceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<GalleryImageDTO> imagesPage = galleryImageService.getAllImages(
                provinceId, portId, serviceTypeId, imageTypeId, pageable
            );
            
            List<PublicGalleryImageResponse> content = imagesPage.getContent().stream()
                .map(img -> new PublicGalleryImageResponse(
                    img.getId(),
                    img.getImageUrl(),
                    img.getPort() != null ? img.getPort().getName() : "Unknown Port",
                    img.getProvince() != null ? img.getProvince().getName() : "Unknown Province",
                    img.getImageType() != null ? img.getImageType().getDisplayName() : "Unknown",
                    img.getServiceType() != null ? img.getServiceType().getId() : null,
                    img.getServiceType() != null ? img.getServiceType().getName() : null,
                    img.getServiceType() != null ? img.getServiceType().getDisplayName() : null,
                    img.getServiceType() != null ? img.getServiceType().getName() : null
                ))
                .toList();

            PagedGalleryResponse response = new PagedGalleryResponse(
                content,
                imagesPage.getTotalElements(),
                imagesPage.getTotalPages(),
                imagesPage.getNumber()
            );
            
            return ResponseEntity.ok(ApiResponse.success(
                "Gallery images retrieved successfully", 
                response
            ));
        } catch (Exception e) {
            log.error("Error retrieving gallery images with filters", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to retrieve gallery images"));
        }
    }
    
    /**
     * Get gallery images for frontend (old version)
     * GET /api/gallery/images?serviceType=SHIPPING_AGENCY&imageType=GALLERY
     * @deprecated Use /api/gallery/page-image instead
     */
    @Deprecated
    @GetMapping("/images/by-type")
    public ResponseEntity<ApiResponse<List<GalleryImageDTO>>> getGalleryImagesByType(
            @RequestParam String serviceType,
            @RequestParam String imageType) {
        
        try {
            List<GalleryImageDTO> images = galleryImageService.getGalleryImages(serviceType, imageType);
            return ResponseEntity.ok(ApiResponse.success("Gallery images retrieved successfully", images));
        } catch (Exception e) {
            log.error("Error retrieving gallery images", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid service or image type"));
        }
    }
    
    /**
     * Get all gallery images for frontend home page
     * GET /api/gallery/images
     * Returns images with flattened structure for easy frontend consumption
     */
    @GetMapping("/images")
    public ResponseEntity<List<GalleryImageResponse>> getAllGalleryImages() {
        try {
            List<GalleryImageDTO> images = galleryImageService.getAllImagesNoPagination();
            
            List<GalleryImageResponse> response = images.stream()
                    .map(img -> new GalleryImageResponse(
                            img.getId(),
                            img.getImageUrl(),
                            img.getPort() != null ? img.getPort().getName() : "Unknown Port",
                            img.getImageType() != null ? img.getImageType().getDisplayName() : "Unknown",
                            img.getProvince() != null ? img.getProvince().getName() : "Unknown Province",
                            img.getServiceType() != null ? img.getServiceType().getDisplayName() : "Unknown Service"
                    ))
                    .toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving all gallery images", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Response DTO for frontend gallery
     */
    public record GalleryImageResponse(
            Long id,
            String imageUrl,
            String portName,
            String commodities,
            String province,
            String serviceType
    ) {}
    
    /**
     * Paginated response for gallery images
     */
        public record PublicGalleryImageResponse(
            Long id,
            String imageUrl,
            String portName,
            String provinceName,
            String imageTypeName,
            Long serviceTypeId,
            String serviceTypeKey,
            String serviceTypeDisplayName,
            String serviceTypeName
        ) {}

        public record PagedGalleryResponse(
            List<PublicGalleryImageResponse> content,
            long totalElements,
            int totalPages,
            int currentPage
        ) {}
}

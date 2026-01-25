package com.example.seatrans.features.gallery.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.seatrans.features.gallery.dto.GalleryImageDTO;
import com.example.seatrans.features.gallery.dto.UpdateImageRequest;
import com.example.seatrans.features.gallery.service.GalleryImageAdminService;
import com.example.seatrans.shared.dto.ApiResponse;
import com.example.seatrans.shared.dto.CloudinaryUploadResponse;
import com.example.seatrans.shared.service.CloudinaryService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for Gallery Image management (Admin Only)
 * Requires ROLE_INTERNAL
 */
@RestController
@RequestMapping("/api/v1/admin/gallery-images")
@RequiredArgsConstructor
@Validated
@Slf4j
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLOYEE','ROLE_INTERNAL')")
public class GalleryImageAdminController {

    private final GalleryImageAdminService galleryImageService;
    private final CloudinaryService cloudinaryService;

    /**
     * Upload multiple images to Cloudinary
     * POST /api/v1/admin/gallery-images/upload-multiple
     */
    @PostMapping(value = "/upload-multiple", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<List<GalleryImageDTO>>> uploadMultipleImages(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("province_id") Long provinceId,
            @RequestParam("port_id") Long portId,
            @RequestParam("service_type_id") Long serviceTypeId,
            @RequestParam("image_type_id") Long imageTypeId,
            HttpServletRequest request) {

        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            // Upload all files to Cloudinary
            String folder = "gallery";
            List<CloudinaryUploadResponse> cloudinaryResponses = cloudinaryService.uploadMultipleFiles(files, folder);

            // Save all image URLs to database
            List<GalleryImageDTO> savedImages = new ArrayList<>();
            for (CloudinaryUploadResponse response : cloudinaryResponses) {
                GalleryImageDTO imageDTO = galleryImageService.uploadImage(
                        response.getSecureUrl(),                        response.getPublicId(),                        provinceId,
                        portId,
                        serviceTypeId,
                        imageTypeId,
                        userId);
                savedImages.add(imageDTO);
            }

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Successfully uploaded " + savedImages.size() + " images", savedImages));

        } catch (Exception e) {
            log.error("Error uploading multiple images", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload images: " + e.getMessage()));
        }
    }

    /**
     * Upload new gallery image with file
     * POST /api/admin/gallery-images
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<GalleryImageDTO>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("province_id") Long provinceId,
            @RequestParam("port_id") Long portId,
            @RequestParam("service_type_id") Long serviceTypeId,
            @RequestParam("image_type_id") Long imageTypeId,
            HttpServletRequest request) {

        try {
            // Verify role - check if user is ROLE_INTERNAL
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            // Upload to Cloudinary
            String folder = "gallery";
            CloudinaryUploadResponse cloudinaryResponse = cloudinaryService.uploadFile(file, folder);
            String imageUrl = cloudinaryResponse.getSecureUrl();

            // Upload image
            GalleryImageDTO imageDTO = galleryImageService.uploadImage(
                    imageUrl,                    cloudinaryResponse.getPublicId(),                    provinceId,
                    portId,
                    serviceTypeId,
                    imageTypeId,
                    userId);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Image uploaded successfully", imageDTO));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error uploading image", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload image: " + e.getMessage()));
        }
    }

    /**
     * Save gallery image from URL (Direct upload from frontend)
     * POST /api/v1/admin/gallery-images/save-url
     */
    @PostMapping("/save-url")
    public ResponseEntity<ApiResponse<GalleryImageDTO>> saveImageUrl(
            @Valid @RequestBody com.example.seatrans.features.gallery.dto.CreateImageRequest requestDto,
            HttpServletRequest request) {

        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            // Create image record directly from URL
            GalleryImageDTO imageDTO = galleryImageService.uploadImage(
                    requestDto.getImageUrl(),
                    requestDto.getProvinceId(),
                    requestDto.getPortId(),
                    requestDto.getServiceTypeId(),
                    requestDto.getImageTypeId(),
                    userId);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Image URL saved successfully", imageDTO));

        } catch (Exception e) {
            log.error("Error saving image URL", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to save image URL: " + e.getMessage()));
        }
    }

    /**
     * Get all images without pagination (for admin management)
     * GET /api/admin/gallery-images/all
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<Object>> getAllImagesNoPagination() {
        try {
            var images = galleryImageService.getAllImagesNoPagination();
            return ResponseEntity.ok(ApiResponse.success("Images retrieved successfully", images));
        } catch (Exception e) {
            log.error("Error retrieving images", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve images"));
        }
    }

    /**
     * Get all images with optional filters
     * GET
     * /api/admin/gallery-images?serviceTypeId=1&imageTypeId=2&provinceId=3&portId=4&page=0&size=20
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getAllImages(
            @RequestParam(required = false) Long provinceId,
            @RequestParam(required = false) Long portId,
            @RequestParam(required = false) Long serviceTypeId,
            @RequestParam(required = false) Long imageTypeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<GalleryImageDTO> images = galleryImageService.getAllImages(provinceId, portId, serviceTypeId,
                    imageTypeId, pageable);

            // Return paginated response
            return ResponseEntity.ok(ApiResponse.success("Images retrieved successfully", images));

        } catch (Exception e) {
            log.error("Error retrieving images", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve images"));
        }
    }

    /**
     * Get image by ID
     * GET /api/admin/gallery-images/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GalleryImageDTO>> getImageById(@PathVariable Long id) {
        try {
            GalleryImageDTO image = galleryImageService.getImageById(id);
            return ResponseEntity.ok(ApiResponse.success("Image retrieved successfully", image));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update image
     * PUT /api/admin/gallery-images/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GalleryImageDTO>> updateImage(
            @PathVariable Long id,
            @Valid @RequestBody UpdateImageRequest request) {

        try {
            GalleryImageDTO updated = galleryImageService.updateImage(id, request);
            return ResponseEntity.ok(ApiResponse.success("Image updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete image
     * DELETE /api/admin/gallery-images/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteImage(@PathVariable Long id) {
        try {
            galleryImageService.deleteImage(id);
            return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}

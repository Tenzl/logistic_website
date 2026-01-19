package com.example.seatrans.features.gallery.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.gallery.dto.ImageCountDTO;
import com.example.seatrans.features.gallery.dto.ImageTypeDTO;
import com.example.seatrans.features.gallery.service.ImageTypePublicService;
import com.example.seatrans.shared.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * Public API Controller for Image Types
 * Accessible by all users (no role required)
 */
@RestController
@RequestMapping("/api/v1/image-types")
@RequiredArgsConstructor
public class ImageTypePublicController {

    private final ImageTypePublicService imageTypeService;

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ImageTypeDTO>>> getActiveImageTypes() {
        try {
            List<ImageTypeDTO> imageTypes = imageTypeService.getActiveImageTypes();
            return ResponseEntity.ok(ApiResponse.success("Active image types retrieved successfully", imageTypes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving active image types"));
        }
    }

    @GetMapping("/service-type/{serviceTypeId}")
    public ResponseEntity<ApiResponse<List<ImageTypeDTO>>> getImageTypesByServiceType(@PathVariable Long serviceTypeId) {
        try {
            List<ImageTypeDTO> imageTypes = imageTypeService.getImageTypesByServiceType(serviceTypeId);
            return ResponseEntity.ok(ApiResponse.success("Image types retrieved successfully", imageTypes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving image types"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ImageTypeDTO>>> searchImageTypes(@RequestParam(required = false) String query) {
        try {
            List<ImageTypeDTO> imageTypes = imageTypeService.searchImageTypes(query);
            return ResponseEntity.ok(ApiResponse.success("Search completed successfully", imageTypes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error searching image types"));
        }
    }

    @GetMapping("/service-type/{serviceTypeId}/search")
    public ResponseEntity<ApiResponse<List<ImageTypeDTO>>> searchImageTypesByServiceType(
            @PathVariable Long serviceTypeId, 
            @RequestParam(required = false) String query) {
        try {
            List<ImageTypeDTO> imageTypes = imageTypeService.searchImageTypesByServiceType(serviceTypeId, query);
            return ResponseEntity.ok(ApiResponse.success("Search completed successfully", imageTypes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error searching image types"));
        }
    }

    @GetMapping("/{id}/image-count")
    public ResponseEntity<ApiResponse<ImageCountDTO>> getImageCount(
            @PathVariable Long id,
            @RequestParam(required = false) Long provinceId,
            @RequestParam(required = false) Long portId,
            @RequestParam(required = false) Long serviceTypeId) {
        try {
            ImageCountDTO count;
            if (provinceId != null && portId != null && serviceTypeId != null) {
                count = imageTypeService.getImageCount(provinceId, portId, serviceTypeId, id);
            } else {
                count = imageTypeService.getImageCount(id);
            }
            return ResponseEntity.ok(ApiResponse.success("Image count retrieved successfully", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving image count"));
        }
    }
}

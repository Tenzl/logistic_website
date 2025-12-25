package com.example.seatrans.features.gallery.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.gallery.dto.CreateImageTypeRequest;
import com.example.seatrans.features.gallery.dto.ImageCountDTO;
import com.example.seatrans.features.gallery.dto.ImageTypeDTO;
import com.example.seatrans.features.gallery.service.ImageTypeService;
import com.example.seatrans.shared.dto.ApiResponse;

@RestController
@RequestMapping("/api/image-types")
public class ImageTypeController {

    @Autowired
    private ImageTypeService imageTypeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ImageTypeDTO>>> getAllImageTypes() {
        try {
            List<ImageTypeDTO> imageTypes = imageTypeService.getAllImageTypes();
            return ResponseEntity.ok(ApiResponse.success("Image types retrieved successfully", imageTypes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving image types"));
        }
    }

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
    public ResponseEntity<ApiResponse<List<ImageTypeDTO>>> searchImageTypesByServiceType(@PathVariable Long serviceTypeId, @RequestParam(required = false) String query) {
        try {
            List<ImageTypeDTO> imageTypes = imageTypeService.searchImageTypesByServiceType(serviceTypeId, query);
            return ResponseEntity.ok(ApiResponse.success("Search completed successfully", imageTypes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error searching image types"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImageTypeDTO>> getImageTypeById(@PathVariable Long id) {
        try {
            ImageTypeDTO imageType = imageTypeService.getImageTypeById(id);
            if (imageType == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Image type not found"));
            }
            return ResponseEntity.ok(ApiResponse.success("Image type retrieved successfully", imageType));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving image type"));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ImageTypeDTO>> createImageType(@RequestBody CreateImageTypeRequest request) {
        try {
            ImageTypeDTO imageType = imageTypeService.createImageType(request);
            if (imageType == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Service type not found"));
            }
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Image type created successfully", imageType));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error creating image type"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ImageTypeDTO>> updateImageType(@PathVariable Long id, @RequestBody CreateImageTypeRequest request) {
        try {
            ImageTypeDTO imageType = imageTypeService.updateImageType(id, request);
            if (imageType == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Image type not found"));
            }
            return ResponseEntity.ok(ApiResponse.success("Image type updated successfully", imageType));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating image type"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteImageType(@PathVariable Long id) {
        try {
            imageTypeService.deleteImageType(id);
            return ResponseEntity.ok(ApiResponse.success("Image type deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error deleting image type"));
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


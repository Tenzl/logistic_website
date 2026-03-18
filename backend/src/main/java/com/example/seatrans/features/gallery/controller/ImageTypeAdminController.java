package com.example.seatrans.features.gallery.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.gallery.dto.CargoTypeCatalogDTO;
import com.example.seatrans.features.gallery.dto.CargoTypeCatalogUpsertRequest;
import com.example.seatrans.features.gallery.dto.CreateImageTypeRequest;
import com.example.seatrans.features.gallery.dto.ImageTypeDTO;
import com.example.seatrans.features.gallery.service.CargoTypeCatalogService;
import com.example.seatrans.features.gallery.service.ImageTypeAdminService;
import com.example.seatrans.shared.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * Admin API Controller for Image Types
 * Requires ROLE_INTERNAL (ADMIN or EMPLOYEE)
 */
@RestController
@RequestMapping("/api/v1/admin/image-types")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLOYEE','ROLE_INTERNAL')")
public class ImageTypeAdminController {

    private final ImageTypeAdminService imageTypeService;
    private final CargoTypeCatalogService cargoTypeCatalogService;

    @GetMapping("/cargo-types")
    public ResponseEntity<ApiResponse<List<CargoTypeCatalogDTO>>> getCargoTypes(
            @RequestParam(required = false) Long serviceTypeId,
            @RequestParam(required = false) String serviceTypeType) {
        try {
            List<CargoTypeCatalogDTO> cargoTypes;
            if (serviceTypeId != null) {
                cargoTypes = cargoTypeCatalogService.getByServiceTypeId(serviceTypeId);
            } else {
                cargoTypes = cargoTypeCatalogService.getByServiceTypeType(serviceTypeType);
            }
            return ResponseEntity.ok(ApiResponse.success("Cargo types retrieved successfully", cargoTypes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving cargo types"));
        }
    }

    @PostMapping("/cargo-types")
    public ResponseEntity<ApiResponse<CargoTypeCatalogDTO>> createCargoType(@RequestBody CargoTypeCatalogUpsertRequest request) {
        try {
            CargoTypeCatalogDTO result = cargoTypeCatalogService.createCargoType(request);
            if (result == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Invalid service type or cargo type payload"));
            }
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Cargo type created successfully", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error creating cargo type"));
        }
    }

    @PutMapping("/cargo-types")
    public ResponseEntity<ApiResponse<CargoTypeCatalogDTO>> updateCargoType(@RequestBody CargoTypeCatalogUpsertRequest request) {
        try {
            CargoTypeCatalogDTO result = cargoTypeCatalogService.updateCargoType(request);
            if (result == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Cargo type not found or invalid payload"));
            }
            return ResponseEntity.ok(ApiResponse.success("Cargo type updated successfully", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating cargo type"));
        }
    }

    @DeleteMapping("/cargo-types")
    public ResponseEntity<ApiResponse<Void>> deleteCargoType(
            @RequestParam Long serviceTypeId,
            @RequestParam String code) {
        try {
            boolean deleted = cargoTypeCatalogService.deleteCargoType(serviceTypeId, code);
            if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Cargo type not found"));
            }
            return ResponseEntity.ok(ApiResponse.success("Cargo type deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error deleting cargo type"));
        }
    }

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
    public ResponseEntity<ApiResponse<ImageTypeDTO>> updateImageType(
            @PathVariable Long id, 
            @RequestBody CreateImageTypeRequest request) {
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
}

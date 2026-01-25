package com.example.seatrans.features.logistics.controller;

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

import com.example.seatrans.features.logistics.dto.CreateServiceTypeRequest;
import com.example.seatrans.features.logistics.dto.ServiceTypeDTO;
import com.example.seatrans.features.logistics.service.ServiceTypeService;
import com.example.seatrans.shared.dto.ApiResponse;

@RestController
@RequestMapping("/api/v1/service-types")
public class ServiceTypeController {

    @Autowired
    private ServiceTypeService serviceTypeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceTypeDTO>>> getAllServiceTypes() {
        try {
            List<ServiceTypeDTO> serviceTypes = serviceTypeService.getAllServiceTypes();
            return ResponseEntity.ok(ApiResponse.success("Service types retrieved successfully", serviceTypes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving service types"));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ServiceTypeDTO>>> getActiveServiceTypes() {
        try {
            List<ServiceTypeDTO> serviceTypes = serviceTypeService.getActiveServiceTypes();
            return ResponseEntity.ok(ApiResponse.success("Active service types retrieved successfully", serviceTypes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving active service types"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ServiceTypeDTO>>> searchServiceTypes(@RequestParam(required = false) String query) {
        try {
            List<ServiceTypeDTO> serviceTypes = serviceTypeService.searchServiceTypes(query);
            return ResponseEntity.ok(ApiResponse.success("Search completed successfully", serviceTypes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error searching service types"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceTypeDTO>> getServiceTypeById(@PathVariable Long id) {
        try {
            ServiceTypeDTO serviceType = serviceTypeService.getServiceTypeById(id);
            if (serviceType == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Service type not found"));
            }
            return ResponseEntity.ok(ApiResponse.success("Service type retrieved successfully", serviceType));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving service type"));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceTypeDTO>> createServiceType(@RequestBody CreateServiceTypeRequest request) {
        try {
            ServiceTypeDTO serviceType = serviceTypeService.createServiceType(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Service type created successfully", serviceType));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error creating service type"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceTypeDTO>> updateServiceType(@PathVariable Long id, @RequestBody CreateServiceTypeRequest request) {
        try {
            ServiceTypeDTO serviceType = serviceTypeService.updateServiceType(id, request);
            if (serviceType == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Service type not found"));
            }
            return ResponseEntity.ok(ApiResponse.success("Service type updated successfully", serviceType));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating service type"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteServiceType(@PathVariable Long id) {
        try {
            serviceTypeService.deleteServiceType(id);
            return ResponseEntity.ok(ApiResponse.success("Service type deleted successfully", null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error deleting service type"));
        }
    }
}


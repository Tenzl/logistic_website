package com.example.seatrans.features.logistics.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.logistics.dto.CreateOfficeRequest;
import com.example.seatrans.features.logistics.dto.OfficeDTO;
import com.example.seatrans.features.logistics.service.OfficeService;
import com.example.seatrans.shared.dto.ApiResponse;

@RestController
@RequestMapping("/api/v1/admin/offices")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLOYEE','ROLE_INTERNAL')")
public class AdminOfficeController {

    @Autowired
    private OfficeService officeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OfficeDTO>>> getAllOffices() {
        try {
            List<OfficeDTO> offices = officeService.getAllActiveOffices();
            return ResponseEntity.ok(ApiResponse.success("Offices retrieved successfully", offices));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving offices: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OfficeDTO>> createOffice(@RequestBody CreateOfficeRequest request) {
        try {
            OfficeDTO office = officeService.createOffice(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Office created successfully", office));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error creating office: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OfficeDTO>> updateOffice(
            @PathVariable Long id,
            @RequestBody CreateOfficeRequest request) {
        try {
            OfficeDTO office = officeService.updateOffice(id, request);
            if (office == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Office not found"));
            }
            return ResponseEntity.ok(ApiResponse.success("Office updated successfully", office));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating office: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOffice(@PathVariable Long id) {
        try {
            boolean deleted = officeService.deleteOffice(id);
            if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Office not found"));
            }
            return ResponseEntity.ok(ApiResponse.success("Office deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error deleting office: " + e.getMessage()));
        }
    }
}

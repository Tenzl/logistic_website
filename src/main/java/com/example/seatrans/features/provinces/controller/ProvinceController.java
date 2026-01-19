package com.example.seatrans.features.provinces.controller;

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

import com.example.seatrans.features.provinces.dto.CreateProvinceRequest;
import com.example.seatrans.features.provinces.dto.ProvinceDTO;
import com.example.seatrans.features.provinces.service.ProvinceService;
import com.example.seatrans.shared.dto.ApiResponse;

@RestController
@RequestMapping("/api/v1/provinces")
public class ProvinceController {

    @Autowired
    private ProvinceService provinceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProvinceDTO>>> getAllProvinces() {
        try {
            List<ProvinceDTO> provinces = provinceService.getAllProvinces();
            return ResponseEntity.ok(ApiResponse.success("Provinces retrieved successfully", provinces));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving provinces"));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ProvinceDTO>>> getActiveProvinces() {
        try {
            List<ProvinceDTO> provinces = provinceService.getActiveProvinces();
            return ResponseEntity.ok(ApiResponse.success("Active provinces retrieved successfully", provinces));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving active provinces"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProvinceDTO>>> searchProvinces(@RequestParam(required = false) String query) {
        try {
            List<ProvinceDTO> provinces = provinceService.searchProvinces(query);
            return ResponseEntity.ok(ApiResponse.success("Search completed successfully", provinces));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error searching provinces"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProvinceDTO>> getProvinceById(@PathVariable Long id) {
        try {
            ProvinceDTO province = provinceService.getProvinceById(id);
            if (province == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Province not found"));
            }
            return ResponseEntity.ok(ApiResponse.success("Province retrieved successfully", province));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving province"));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProvinceDTO>> createProvince(@RequestBody CreateProvinceRequest request) {
        try {
            ProvinceDTO province = provinceService.createProvince(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Province created successfully", province));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error creating province"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProvinceDTO>> updateProvince(@PathVariable Long id, @RequestBody CreateProvinceRequest request) {
        try {
            ProvinceDTO province = provinceService.updateProvince(id, request);
            if (province == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Province not found"));
            }
            return ResponseEntity.ok(ApiResponse.success("Province updated successfully", province));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating province"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProvince(@PathVariable Long id) {
        try {
            provinceService.deleteProvince(id);
            return ResponseEntity.ok(ApiResponse.success("Province deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error deleting province"));
        }
    }
}

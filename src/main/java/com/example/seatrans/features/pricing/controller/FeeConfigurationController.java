package com.example.seatrans.features.pricing.controller;

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

import com.example.seatrans.shared.dto.ApiResponse;
import com.example.seatrans.features.pricing.dto.CreateFeeConfigDTO;
import com.example.seatrans.features.pricing.dto.UpdateFeeConfigDTO;
import com.example.seatrans.features.pricing.dto.FeeConfigResponseDTO;
import com.example.seatrans.features.logistics.model.ServiceType;
import com.example.seatrans.features.pricing.service.FeeConfigurationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Controller quản lý Fee Configuration
 * CHỈ ADMIN được phép truy cập tất cả endpoints
 */
@RestController
@RequestMapping("/api/admin/fee-configs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN được truy cập controller này
public class FeeConfigurationController {

    private final FeeConfigurationService feeConfigService;

    /**
     * Tạo fee configuration mới
     * POST /api/admin/fee-configs
     */
    @PostMapping
    public ResponseEntity<ApiResponse<FeeConfigResponseDTO>> createFeeConfig(
            @Valid @RequestBody CreateFeeConfigDTO dto) {

        FeeConfigResponseDTO result = feeConfigService.createFeeConfig(dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Fee configuration created successfully", result));
    }

    /**
     * Cập nhật fee configuration
     * PUT /api/admin/fee-configs/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FeeConfigResponseDTO>> updateFeeConfig(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFeeConfigDTO dto) {

        FeeConfigResponseDTO result = feeConfigService.updateFeeConfig(id, dto);

        return ResponseEntity.ok(
                ApiResponse.success("Fee configuration updated successfully", result)
        );
    }

    /**
     * Xóa fee configuration
     * DELETE /api/admin/fee-configs/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFeeConfig(@PathVariable Long id) {

        feeConfigService.deleteFeeConfig(id);

        return ResponseEntity.ok(
                ApiResponse.success("Fee configuration deleted successfully", null)
        );
    }

    /**
     * Lấy tất cả fee configurations theo service type
     * GET /api/admin/fee-configs?serviceType=SHIPPING_AGENCY
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<FeeConfigResponseDTO>>> getAllFeeConfigs(
            @RequestParam ServiceType serviceType) {

        List<FeeConfigResponseDTO> result = feeConfigService.getAllFeeConfigs(serviceType);

        return ResponseEntity.ok(
                ApiResponse.success("Fee configurations retrieved successfully", result)
        );
    }

    /**
     * Lấy fee configurations ACTIVE theo service type
     * GET /api/admin/fee-configs/active?serviceType=SHIPPING_AGENCY
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<FeeConfigResponseDTO>>> getActiveFeeConfigs(
            @RequestParam ServiceType serviceType) {

        List<FeeConfigResponseDTO> result = feeConfigService.getActiveFeeConfigs(serviceType);

        return ResponseEntity.ok(
                ApiResponse.success("Active fee configurations retrieved successfully", result)
        );
    }

    /**
     * Lấy fee configurations theo service type và port
     * GET /api/admin/fee-configs/by-port?serviceType=SHIPPING_AGENCY&port=HAIPHONG
     */
    @GetMapping("/by-port")
    public ResponseEntity<ApiResponse<List<FeeConfigResponseDTO>>> getFeeConfigsByPort(
            @RequestParam ServiceType serviceType,
            @RequestParam String port) {

        List<FeeConfigResponseDTO> result = feeConfigService.getFeeConfigsByPort(serviceType, port);

        return ResponseEntity.ok(
                ApiResponse.success("Fee configurations retrieved successfully", result)
        );
    }

    /**
     * Lấy chi tiết fee configuration
     * GET /api/admin/fee-configs/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FeeConfigResponseDTO>> getFeeConfigById(@PathVariable Long id) {

        FeeConfigResponseDTO result = feeConfigService.getFeeConfigById(id);

        return ResponseEntity.ok(
                ApiResponse.success("Fee configuration retrieved successfully", result)
        );
    }

}

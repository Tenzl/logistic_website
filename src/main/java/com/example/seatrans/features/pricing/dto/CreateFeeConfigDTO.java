package com.example.seatrans.features.pricing.dto;

import com.example.seatrans.features.pricing.model.FeeFormulaType;
import com.example.seatrans.features.pricing.model.FeeStatus;
import com.example.seatrans.features.logistics.model.ServiceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO để tạo fee configuration mới
 * Chỉ ADMIN được sử dụng
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateFeeConfigDTO {

    @NotBlank(message = "Fee name is required")
    @Size(max = 200, message = "Fee name must not exceed 200 characters")
    private String feeName;

    @NotBlank(message = "Fee code is required")
    @Size(max = 50, message = "Fee code must not exceed 50 characters")
    private String feeCode;

    @NotNull(message = "Service type is required")
    private ServiceType serviceType;

    @NotNull(message = "Formula type is required")
    private FeeFormulaType formulaType;

    @NotBlank(message = "Formula is required")
    private String formula;

    @Size(max = 1000, message = "Formula description must not exceed 1000 characters")
    private String formulaDescription;

    private Integer displayOrder; // Nếu null, sẽ thêm vào cuối

    @Builder.Default
    private FeeStatus status = FeeStatus.ACTIVE;

    @Size(max = 100, message = "Applicable port must not exceed 100 characters")
    private String applicablePort; // null = áp dụng tất cả cổng

    private String conditions; // JSON format

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}

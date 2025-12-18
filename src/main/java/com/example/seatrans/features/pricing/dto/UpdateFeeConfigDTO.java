package com.example.seatrans.features.pricing.dto;

import com.example.seatrans.features.pricing.model.FeeFormulaType;
import com.example.seatrans.features.pricing.model.FeeStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO để cập nhật fee configuration
 * Chỉ ADMIN được sử dụng
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFeeConfigDTO {

    @Size(max = 200, message = "Fee name must not exceed 200 characters")
    private String feeName;

    private FeeFormulaType formulaType;

    private String formula;

    @Size(max = 1000, message = "Formula description must not exceed 1000 characters")
    private String formulaDescription;

    private Integer displayOrder;

    private FeeStatus status;

    @Size(max = 100, message = "Applicable port must not exceed 100 characters")
    private String applicablePort;

    private String conditions;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}

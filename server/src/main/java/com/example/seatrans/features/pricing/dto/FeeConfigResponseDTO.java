package com.example.seatrans.features.pricing.dto;

import com.example.seatrans.features.pricing.model.FeeFormulaType;
import com.example.seatrans.features.pricing.model.FeeStatus;
import com.example.seatrans.features.logistics.model.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO response cho fee configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeConfigResponseDTO {

    private Long id;
    private String feeName;
    private String feeCode;
    private ServiceType serviceType;
    private FeeFormulaType formulaType;
    private String formula;
    private String formulaDescription;
    private Integer displayOrder;
    private FeeStatus status;
    private String applicablePort;
    private String conditions;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.example.seatrans.features.pricing.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.seatrans.features.pricing.dto.CreateFeeConfigDTO;
import com.example.seatrans.features.pricing.dto.UpdateFeeConfigDTO;
import com.example.seatrans.features.pricing.dto.FeeConfigResponseDTO;
import com.example.seatrans.features.pricing.model.FeeConfiguration;
import com.example.seatrans.features.pricing.model.FeeFormulaType;
import com.example.seatrans.features.pricing.model.FeeStatus;
import com.example.seatrans.features.logistics.model.ServiceType;
import com.example.seatrans.shared.exception.DuplicateFeeCodeException;
import com.example.seatrans.shared.exception.FeeConfigurationNotFoundException;
import com.example.seatrans.shared.exception.InvalidFormulaException;
import com.example.seatrans.features.pricing.repository.FeeConfigurationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service quản lý Fee Configuration
 * CHỈ ADMIN được phép sử dụng (check ở Controller)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FeeConfigurationService {

    private final FeeConfigurationRepository feeConfigRepository;

    /**
     * Tạo fee configuration mới
     */
    @Transactional
    public FeeConfigResponseDTO createFeeConfig(CreateFeeConfigDTO dto) {
        log.info("Creating fee configuration: {}", dto.getFeeCode());

        // Kiểm tra feeCode đã tồn tại chưa
        if (feeConfigRepository.existsByFeeCode(dto.getFeeCode())) {
            throw new DuplicateFeeCodeException("Fee code already exists: " + dto.getFeeCode());
        }

        // Validate formula
        validateFormula(dto.getFormulaType(), dto.getFormula());

        // Nếu không set displayOrder, thêm vào cuối
        Integer displayOrder = dto.getDisplayOrder();
        if (displayOrder == null) {
            displayOrder = feeConfigRepository.getMaxDisplayOrder(dto.getServiceType()) + 1;
        }

        FeeConfiguration feeConfig = FeeConfiguration.builder()
                .feeName(dto.getFeeName())
                .feeCode(dto.getFeeCode())
                .serviceType(dto.getServiceType())
                .formulaType(dto.getFormulaType())
                .formula(dto.getFormula())
                .formulaDescription(dto.getFormulaDescription())
                .displayOrder(displayOrder)
                .status(dto.getStatus() != null ? dto.getStatus() : FeeStatus.ACTIVE)
                .applicablePort(dto.getApplicablePort())
                .conditions(dto.getConditions())
                .notes(dto.getNotes())
                .build();

        FeeConfiguration saved = feeConfigRepository.save(feeConfig);
        log.info("Fee configuration created successfully: ID={}", saved.getId());

        return mapToResponseDTO(saved);
    }

    /**
     * Cập nhật fee configuration
     */
    @Transactional
    public FeeConfigResponseDTO updateFeeConfig(Long id, UpdateFeeConfigDTO dto) {
        log.info("Updating fee configuration: ID={}", id);

        FeeConfiguration feeConfig = feeConfigRepository.findById(id)
                .orElseThrow(() -> new FeeConfigurationNotFoundException("Fee configuration not found: " + id));

        // Cập nhật các trường nếu có
        if (dto.getFeeName() != null) {
            feeConfig.setFeeName(dto.getFeeName());
        }

        if (dto.getFormulaType() != null) {
            feeConfig.setFormulaType(dto.getFormulaType());
        }

        if (dto.getFormula() != null) {
            // Validate formula mới
            validateFormula(
                    dto.getFormulaType() != null ? dto.getFormulaType() : feeConfig.getFormulaType(),
                    dto.getFormula()
            );
            feeConfig.setFormula(dto.getFormula());
        }

        if (dto.getFormulaDescription() != null) {
            feeConfig.setFormulaDescription(dto.getFormulaDescription());
        }

        if (dto.getDisplayOrder() != null) {
            feeConfig.setDisplayOrder(dto.getDisplayOrder());
        }

        if (dto.getStatus() != null) {
            feeConfig.setStatus(dto.getStatus());
        }

        if (dto.getApplicablePort() != null) {
            feeConfig.setApplicablePort(dto.getApplicablePort());
        }

        if (dto.getConditions() != null) {
            feeConfig.setConditions(dto.getConditions());
        }

        if (dto.getNotes() != null) {
            feeConfig.setNotes(dto.getNotes());
        }

        FeeConfiguration updated = feeConfigRepository.save(feeConfig);
        log.info("Fee configuration updated successfully: ID={}", updated.getId());

        return mapToResponseDTO(updated);
    }

    /**
     * Xóa fee configuration
     */
    @Transactional
    public void deleteFeeConfig(Long id) {
        log.info("Deleting fee configuration: ID={}", id);

        if (!feeConfigRepository.existsById(id)) {
            throw new FeeConfigurationNotFoundException("Fee configuration not found: " + id);
        }

        feeConfigRepository.deleteById(id);
        log.info("Fee configuration deleted successfully: ID={}", id);
    }

    /**
     * Lấy tất cả fee configurations theo service type
     */
    public List<FeeConfigResponseDTO> getAllFeeConfigs(ServiceType serviceType) {
        log.info("Fetching all fee configurations for service type: {}", serviceType);

        return feeConfigRepository.findByServiceTypeOrderByDisplayOrderAsc(serviceType)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy fee configurations ACTIVE theo service type
     */
    public List<FeeConfigResponseDTO> getActiveFeeConfigs(ServiceType serviceType) {
        log.info("Fetching active fee configurations for service type: {}", serviceType);

        return feeConfigRepository.findByServiceTypeAndStatusOrderByDisplayOrderAsc(
                        serviceType,
                        FeeStatus.ACTIVE
                )
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy fee configurations theo service type và port
     */
    public List<FeeConfigResponseDTO> getFeeConfigsByPort(ServiceType serviceType, String port) {
        log.info("Fetching fee configurations for service type: {} and port: {}", serviceType, port);

        return feeConfigRepository.findByServiceTypeAndPort(serviceType, FeeStatus.ACTIVE, port)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết fee configuration
     */
    public FeeConfigResponseDTO getFeeConfigById(Long id) {
        log.info("Fetching fee configuration: ID={}", id);

        FeeConfiguration feeConfig = feeConfigRepository.findById(id)
                .orElseThrow(() -> new FeeConfigurationNotFoundException("Fee configuration not found: " + id));

        return mapToResponseDTO(feeConfig);
    }

    /**
     * Validate formula dựa trên formula type
     */
    private void validateFormula(FeeFormulaType formulaType, String formula) {
        if (formula == null || formula.trim().isEmpty()) {
            throw new InvalidFormulaException("Formula cannot be empty");
        }

        // Basic validation - có thể mở rộng thêm
        switch (formulaType) {
            case FIXED:
                // Fixed formula nên là một số
                try {
                    Double.parseDouble(formula);
                } catch (NumberFormatException e) {
                    throw new InvalidFormulaException("Fixed formula must be a valid number");
                }
                break;

            case PERCENTAGE:
                // Percentage formula nên có % hoặc là số
                if (!formula.contains("%") && !formula.matches(".*\\d+.*")) {
                    throw new InvalidFormulaException("Percentage formula must contain a number or %");
                }
                break;

            case SIMPLE_MULTIPLICATION:
            case BASE_PLUS_VARIABLE:
            case CONDITIONAL:
            case COMPLEX_FORMULA:
            case TIERED_PRICING:
                // Các loại khác cần validate JSON hoặc expression - implement sau
                // Hiện tại chỉ check không rỗng
                break;

            default:
                throw new InvalidFormulaException("Unknown formula type");
        }
    }

    /**
     * Map entity sang DTO
     */
    private FeeConfigResponseDTO mapToResponseDTO(FeeConfiguration feeConfig) {
        return FeeConfigResponseDTO.builder()
                .id(feeConfig.getId())
                .feeName(feeConfig.getFeeName())
                .feeCode(feeConfig.getFeeCode())
                .serviceType(feeConfig.getServiceType())
                .formulaType(feeConfig.getFormulaType())
                .formula(feeConfig.getFormula())
                .formulaDescription(feeConfig.getFormulaDescription())
                .displayOrder(feeConfig.getDisplayOrder())
                .status(feeConfig.getStatus())
                .applicablePort(feeConfig.getApplicablePort())
                .conditions(feeConfig.getConditions())
                .notes(feeConfig.getNotes())
                .createdAt(feeConfig.getCreatedAt())
                .updatedAt(feeConfig.getUpdatedAt())
                .build();
    }
}

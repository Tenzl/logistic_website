package com.example.seatrans.features.gallery.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.seatrans.features.gallery.dto.CargoTypeCatalogDTO;
import com.example.seatrans.features.gallery.dto.CargoTypeCatalogUpsertRequest;
import com.example.seatrans.features.gallery.model.CargoTypeCatalogEntity;
import com.example.seatrans.features.gallery.model.CargoTypeCatalogId;
import com.example.seatrans.features.gallery.repository.CargoTypeCatalogRepository;
import com.example.seatrans.features.logistics.model.ServiceTypeEntity;
import com.example.seatrans.features.logistics.repository.ServiceTypeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CargoTypeCatalogService {

    private final CargoTypeCatalogRepository cargoTypeCatalogRepository;
    private final ServiceTypeRepository serviceTypeRepository;

    public List<CargoTypeCatalogDTO> getByServiceTypeId(Long serviceTypeId) {
        return serviceTypeRepository.findById(serviceTypeId)
                .map(ServiceTypeEntity::getName)
                .map(this::normalizeServiceTypeType)
                .map(this::getByServiceTypeType)
                .orElse(List.of());
    }

    public CargoTypeCatalogDTO createCargoType(CargoTypeCatalogUpsertRequest request) {
        if (request == null || request.getServiceTypeId() == null) {
            return null;
        }

        ServiceTypeEntity serviceType = serviceTypeRepository.findById(request.getServiceTypeId()).orElse(null);
        if (serviceType == null) {
            return null;
        }

        String serviceTypeType = normalizeServiceTypeType(serviceType.getName());
        String code = normalizeCode(request.getCode(), request.getDisplayLabel());
        String displayLabel = request.getDisplayLabel() == null ? "" : request.getDisplayLabel().trim();
        if (code.isBlank() || displayLabel.isBlank()) {
            return null;
        }

        CargoTypeCatalogId id = new CargoTypeCatalogId(serviceTypeType, code);
        CargoTypeCatalogEntity existing = cargoTypeCatalogRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setDisplayLabel(displayLabel);
            existing.setIsActive(true);
            CargoTypeCatalogEntity updated = cargoTypeCatalogRepository.save(existing);
            return new CargoTypeCatalogDTO(updated.getCode(), updated.getDisplayLabel(), updated.getServiceTypeType());
        }

        CargoTypeCatalogEntity entity = CargoTypeCatalogEntity.builder()
                .serviceTypeType(serviceTypeType)
                .code(code)
                .displayLabel(displayLabel)
                .isActive(true)
                .build();

        CargoTypeCatalogEntity saved = cargoTypeCatalogRepository.save(entity);
        return new CargoTypeCatalogDTO(saved.getCode(), saved.getDisplayLabel(), saved.getServiceTypeType());
    }

    public CargoTypeCatalogDTO updateCargoType(CargoTypeCatalogUpsertRequest request) {
        if (request == null || request.getServiceTypeId() == null || request.getCode() == null) {
            return null;
        }

        ServiceTypeEntity serviceType = serviceTypeRepository.findById(request.getServiceTypeId()).orElse(null);
        if (serviceType == null) {
            return null;
        }

        String serviceTypeType = normalizeServiceTypeType(serviceType.getName());
        String code = normalizeCode(request.getCode(), null);
        String displayLabel = request.getDisplayLabel() == null ? "" : request.getDisplayLabel().trim();
        if (code.isBlank() || displayLabel.isBlank()) {
            return null;
        }

        CargoTypeCatalogId id = new CargoTypeCatalogId(serviceTypeType, code);
        CargoTypeCatalogEntity entity = cargoTypeCatalogRepository.findById(id).orElse(null);
        if (entity == null) {
            return null;
        }

        entity.setDisplayLabel(displayLabel);
        entity.setIsActive(true);
        CargoTypeCatalogEntity saved = cargoTypeCatalogRepository.save(entity);
        return new CargoTypeCatalogDTO(saved.getCode(), saved.getDisplayLabel(), saved.getServiceTypeType());
    }

    public boolean deleteCargoType(Long serviceTypeId, String code) {
        if (serviceTypeId == null || code == null || code.isBlank()) {
            return false;
        }

        ServiceTypeEntity serviceType = serviceTypeRepository.findById(serviceTypeId).orElse(null);
        if (serviceType == null) {
            return false;
        }

        String serviceTypeType = normalizeServiceTypeType(serviceType.getName());
        String normalizedCode = normalizeCode(code, null);
        CargoTypeCatalogId id = new CargoTypeCatalogId(serviceTypeType, normalizedCode);
        if (!cargoTypeCatalogRepository.existsById(id)) {
            return false;
        }

        cargoTypeCatalogRepository.deleteById(id);
        return true;
    }

    public List<CargoTypeCatalogDTO> getByServiceTypeType(String serviceTypeType) {
        String normalizedServiceTypeType = normalizeServiceTypeType(serviceTypeType);
        if (normalizedServiceTypeType.isBlank()) {
            return List.of();
        }

        return cargoTypeCatalogRepository
                .findByServiceTypeTypeAndIsActiveTrueOrderByDisplayLabelAsc(normalizedServiceTypeType)
                .stream()
                .map(entity -> new CargoTypeCatalogDTO(
                        entity.getCode(),
                        entity.getDisplayLabel(),
                        entity.getServiceTypeType()))
                .collect(Collectors.toList());
    }

    public String normalizeServiceTypeType(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }

        return value.trim()
                .toUpperCase()
                .replaceAll("[^A-Z0-9]+", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_|_$", "");
    }

    private String normalizeCode(String code, String displayLabel) {
        String source = (code != null && !code.isBlank()) ? code : displayLabel;
        if (source == null || source.isBlank()) {
            return "";
        }

        return source.trim()
                .toUpperCase()
                .replaceAll("[^A-Z0-9]+", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_|_$", "");
    }
}

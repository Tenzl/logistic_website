package com.example.seatrans.features.inquiry.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.seatrans.features.inquiry.dto.FormFieldDTO;
import com.example.seatrans.features.inquiry.dto.FormFieldRequest;
import com.example.seatrans.features.inquiry.model.ServiceFormField;
import com.example.seatrans.features.inquiry.repository.ServiceFormFieldRepository;
import com.example.seatrans.features.logistics.repository.ServiceTypeRepository;

@Service
public class ServiceFormFieldService {

    private final ServiceFormFieldRepository repository;
    private final ServiceTypeRepository serviceTypeRepository;

    public ServiceFormFieldService(ServiceFormFieldRepository repository,
                                   ServiceTypeRepository serviceTypeRepository) {
        this.repository = repository;
        this.serviceTypeRepository = serviceTypeRepository;
    }

    public List<FormFieldDTO> list(Long serviceTypeId, boolean activeOnly) {
        var fields = activeOnly
            ? repository.findByServiceTypeIdAndIsActiveTrueOrderByPositionAsc(serviceTypeId)
            : repository.findByServiceTypeIdOrderByPositionAsc(serviceTypeId);
        return fields.stream().map(this::toDto).toList();
    }

    @Transactional
    public FormFieldDTO create(Long serviceTypeId, FormFieldRequest request) {
        var serviceType = serviceTypeRepository.findById(serviceTypeId)
            .orElseThrow(() -> new IllegalArgumentException("Invalid service type"));

        repository.findByServiceTypeIdAndKey(serviceTypeId, request.key())
            .ifPresent(f -> { throw new IllegalArgumentException("Field key already exists for this service"); });

        ServiceFormField field = ServiceFormField.builder()
            .serviceType(serviceType)
            .key(request.key())
            .label(request.label())
            .type(request.type())
            .required(request.required())
            .placeholder(request.placeholder())
            .gridSpan(request.gridSpan())
            .options(request.options())
            .position(request.position())
            .isActive(request.isActive())
            .meta(request.meta())
            .build();

        repository.save(field);
        return toDto(field);
    }

    @Transactional
    public FormFieldDTO update(Long id, FormFieldRequest request) {
        ServiceFormField field = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Field not found"));

        repository.findByServiceTypeIdAndKey(field.getServiceType().getId(), request.key())
            .filter(existing -> !existing.getId().equals(id))
            .ifPresent(f -> { throw new IllegalArgumentException("Field key already exists for this service"); });

        field.setKey(request.key());
        field.setLabel(request.label());
        field.setType(request.type());
        field.setRequired(request.required());
        field.setPlaceholder(request.placeholder());
        field.setGridSpan(request.gridSpan());
        field.setOptions(request.options());
        field.setPosition(request.position());
        field.setIsActive(request.isActive());
        field.setMeta(request.meta());

        return toDto(field);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private FormFieldDTO toDto(ServiceFormField field) {
        return FormFieldDTO.builder()
            .id(field.getId())
            .key(field.getKey())
            .label(field.getLabel())
            .type(field.getType())
            .required(field.getRequired())
            .placeholder(field.getPlaceholder())
            .gridSpan(field.getGridSpan())
            .options(field.getOptions())
            .position(field.getPosition())
            .isActive(field.getIsActive())
            .meta(field.getMeta())
            .build();
    }
}

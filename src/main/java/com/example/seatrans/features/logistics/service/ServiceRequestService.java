package com.example.seatrans.features.logistics.service;

import com.example.seatrans.features.logistics.dto.ServiceRequestDTO;
import com.example.seatrans.features.logistics.dto.*;
import com.example.seatrans.features.logistics.model.ServiceRequest;
import com.example.seatrans.shared.exception.UserNotFoundException;
import com.example.seatrans.features.logistics.repository.ServiceRequestRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceRequestService {
    
    private final ServiceRequestRepository serviceRequestRepository;
    private final ObjectMapper objectMapper;
    
    private static final DateTimeFormatter CODE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    
    @Transactional
    public ServiceRequestDTO createLogisticsRequest(LogisticsRequestDTO dto, Long customerId) {
        log.info("Creating logistics request for customer: {}", customerId);
        
        ServiceRequest request = ServiceRequest.builder()
            .requestCode(generateRequestCode())
            .customerId(customerId)
            .serviceType("FREIGHT_FORWARDING")
            .requestStatus("SUBMITTED")
            .fullName(dto.getFullName())
            .contactInfo(dto.getContactInfo())
            .otherInformation(dto.getOtherInformation())
            .build();
        
        try {
            request.setServiceData(objectMapper.writeValueAsString(dto));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize service data", e);
        }
        
        request.setSubmittedAt(LocalDateTime.now());
        request.setExpiresAt(LocalDateTime.now().plusDays(30));
        
        serviceRequestRepository.save(request);
        
        log.info("Logistics request created: {}", request.getRequestCode());
        
        return mapToDTO(request);
    }
    
    @Transactional
    public ServiceRequestDTO createShippingAgencyRequest(ShippingAgencyRequestDTO dto, Long customerId) {
        log.info("Creating shipping agency request for customer: {}", customerId);
        
        ServiceRequest request = ServiceRequest.builder()
            .requestCode(generateRequestCode())
            .customerId(customerId)
            .serviceType("SHIPPING_AGENCY")
            .requestStatus("SUBMITTED")
            .fullName(dto.getFullName())
            .contactInfo(dto.getContactInfo())
            .otherInformation(dto.getOtherInformation())
            .build();
        
        try {
            request.setServiceData(objectMapper.writeValueAsString(dto));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize service data", e);
        }
        
        request.setSubmittedAt(LocalDateTime.now());
        request.setExpiresAt(LocalDateTime.now().plusDays(30));
        
        serviceRequestRepository.save(request);
        
        return mapToDTO(request);
    }
    
    @Transactional
    public ServiceRequestDTO createCharteringRequest(CharteringRequestDTO dto, Long customerId) {
        log.info("Creating chartering request for customer: {}", customerId);
        
        ServiceRequest request = ServiceRequest.builder()
            .requestCode(generateRequestCode())
            .customerId(customerId)
            .serviceType("CHARTERING")
            .requestStatus("SUBMITTED")
            .fullName(dto.getFullName())
            .contactInfo(dto.getContactInfo())
            .otherInformation(dto.getOtherInformation())
            .build();
        
        try {
            request.setServiceData(objectMapper.writeValueAsString(dto));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize service data", e);
        }
        
        request.setSubmittedAt(LocalDateTime.now());
        request.setExpiresAt(LocalDateTime.now().plusDays(30));
        
        serviceRequestRepository.save(request);
        
        return mapToDTO(request);
    }
    
    public List<ServiceRequestDTO> getCustomerRequests(Long customerId) {
        return serviceRequestRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public ServiceRequestDTO getRequestById(Long id, Long customerId) {
        ServiceRequest request = serviceRequestRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("Request not found"));
        
        if (!request.getCustomerId().equals(customerId)) {
            throw new SecurityException("Access denied");
        }
        
        return mapToDTO(request);
    }
    
    private String generateRequestCode() {
        String dateCode = LocalDateTime.now().format(CODE_FORMATTER);
        long count = serviceRequestRepository.count() + 1;
        return String.format("REQ-%s-%04d", dateCode, count);
    }
    
    private ServiceRequestDTO mapToDTO(ServiceRequest entity) {
        Object serviceData;
        try {
            serviceData = objectMapper.readValue(entity.getServiceData(), Object.class);
        } catch (Exception e) {
            serviceData = entity.getServiceData();
        }
        
        return ServiceRequestDTO.builder()
            .id(entity.getId())
            .requestCode(entity.getRequestCode())
            .customerId(entity.getCustomerId())
            .serviceType(entity.getServiceType())
            .requestStatus(entity.getRequestStatus())
            .fullName(entity.getFullName())
            .contactInfo(entity.getContactInfo())
            .otherInformation(entity.getOtherInformation())
            .serviceData(serviceData)
            .submittedAt(entity.getSubmittedAt() != null ? entity.getSubmittedAt().toString() : null)
            .quotedAt(entity.getQuotedAt() != null ? entity.getQuotedAt().toString() : null)
            .expiresAt(entity.getExpiresAt() != null ? entity.getExpiresAt().toString() : null)
            .createdAt(entity.getCreatedAt().toString())
            .updatedAt(entity.getUpdatedAt().toString())
            .build();
    }
}

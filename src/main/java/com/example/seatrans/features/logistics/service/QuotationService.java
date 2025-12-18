package com.example.seatrans.features.logistics.service;

import com.example.seatrans.features.logistics.dto.*;
import com.example.seatrans.features.logistics.model.*;
import com.example.seatrans.shared.exception.UserNotFoundException;
import com.example.seatrans.features.logistics.repository.*;
import com.example.seatrans.features.pricing.repository.PriceCalculationRepository;
import com.example.seatrans.features.pricing.model.PriceCalculation;
import com.example.seatrans.features.pricing.dto.CalculationStepDTO;
import com.example.seatrans.features.pricing.service.PriceCalculationResult;
import com.example.seatrans.features.pricing.service.PriceCalculationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuotationService {
    
    private final QuotationRepository quotationRepository;
    private final QuotationItemRepository quotationItemRepository;
    private final PriceCalculationRepository priceCalculationRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final PriceCalculationService priceCalculationService;
    private final ObjectMapper objectMapper;
    
    private static final DateTimeFormatter CODE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    
    /**
     * Generate quotation from service request (EMPLOYEE)
     */
    @Transactional
    public QuotationInternalDTO generateQuotationFromRequest(Long requestId, Long employeeId) {
        log.info("Generating quotation for request: {}", requestId);
        
        ServiceRequest request = serviceRequestRepository.findById(requestId)
            .orElseThrow(() -> new UserNotFoundException("Request not found"));
        
        // Calculate price based on service type
        PriceCalculationResult calculation = calculatePriceFromRequest(request);
        
        // Create quotation
        Quotation quotation = Quotation.builder()
            .quoteCode(generateQuoteCode())
            .requestId(requestId)
            .customerId(request.getCustomerId())
            .employeeId(employeeId)
            .serviceType(request.getServiceType())
            .quoteStatus("DRAFT")
            .basePrice(calculation.getBasePrice())
            .totalSurcharges(calculation.getTotalSurcharges())
            .totalDiscounts(calculation.getTotalDiscounts())
            .subtotal(calculation.getSubtotal())
            .taxAmount(calculation.getTaxAmount())
            .finalAmount(calculation.getFinalAmount())
            .currency(calculation.getCurrency())
            .quoteDate(LocalDate.now())
            .validUntil(LocalDate.now().plusDays(30))
            .serviceInputData(request.getServiceData())
            .build();
        
        quotationRepository.save(quotation);
        
        // Save quotation items (breakdown)
        saveQuotationItems(quotation.getId(), calculation.getBreakdown());
        
        // Save calculation audit trail
        savePriceCalculations(quotation.getId(), calculation.getCalculationSteps());
        
        // Update request status
        request.setRequestStatus("QUOTED");
        request.setQuotedAt(LocalDateTime.now());
        serviceRequestRepository.save(request);
        
        log.info("Quotation generated: {}", quotation.getQuoteCode());
        
        return mapToInternalDTO(quotation);
    }
    
    /**
     * Get quotation for customer (SANITIZED - FINAL PRICE ONLY)
     */
    public QuotationDTO getCustomerQuotation(Long id, Long customerId) {
        Quotation quotation = quotationRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("Quotation not found"));
        
        if (!quotation.getCustomerId().equals(customerId)) {
            throw new SecurityException("Access denied");
        }
        
        return mapToCustomerDTO(quotation);
    }
    
    /**
     * Get quotation with full breakdown (EMPLOYEE/ADMIN ONLY)
     */
    public QuotationInternalDTO getQuotationWithBreakdown(Long id) {
        Quotation quotation = quotationRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("Quotation not found"));
        
        return mapToInternalDTO(quotation);
    }
    
    /**
     * Send quotation to customer
     */
    @Transactional
    public void sendQuotation(Long id) {
        Quotation quotation = quotationRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("Quotation not found"));
        
        quotation.setQuoteStatus("SENT");
        quotation.setSentAt(LocalDateTime.now());
        quotationRepository.save(quotation);
        
        // TODO: Send email notification
        log.info("Quotation sent: {}", quotation.getQuoteCode());
    }
    
    /**
     * Customer accepts quotation
     */
    @Transactional
    public void acceptQuotation(Long id, Long customerId, String notes) {
        Quotation quotation = quotationRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("Quotation not found"));
        
        if (!quotation.getCustomerId().equals(customerId)) {
            throw new SecurityException("Access denied");
        }
        
        if (!"SENT".equals(quotation.getQuoteStatus())) {
            throw new IllegalStateException("Quotation not in SENT status");
        }
        
        if (quotation.getValidUntil().isBefore(LocalDate.now())) {
            throw new IllegalStateException("Quotation has expired");
        }
        
        quotation.setQuoteStatus("ACCEPTED");
        quotation.setCustomerResponse("ACCEPTED");
        quotation.setCustomerResponseDate(LocalDateTime.now());
        quotation.setCustomerNotes(notes);
        quotationRepository.save(quotation);
        
        log.info("Quotation accepted: {}", quotation.getQuoteCode());
    }
    
    /**
     * Customer rejects quotation
     */
    @Transactional
    public void rejectQuotation(Long id, Long customerId, String notes) {
        Quotation quotation = quotationRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("Quotation not found"));
        
        if (!quotation.getCustomerId().equals(customerId)) {
            throw new SecurityException("Access denied");
        }
        
        quotation.setQuoteStatus("REJECTED");
        quotation.setCustomerResponse("REJECTED");
        quotation.setCustomerResponseDate(LocalDateTime.now());
        quotation.setCustomerNotes(notes);
        quotationRepository.save(quotation);
        
        log.info("Quotation rejected: {}", quotation.getQuoteCode());
    }
    
    public List<QuotationDTO> getCustomerQuotations(Long customerId) {
        return quotationRepository.findByCustomerId(customerId)
            .stream()
            .map(this::mapToCustomerDTO)
            .collect(Collectors.toList());
    }
    
    // ===== PRIVATE METHODS =====
    
    private PriceCalculationResult calculatePriceFromRequest(ServiceRequest request) {
        try {
            switch (request.getServiceType()) {
                case "FREIGHT_FORWARDING":
                    LogisticsRequestDTO logisticsDTO = objectMapper.readValue(
                        request.getServiceData(), LogisticsRequestDTO.class
                    );
                    return priceCalculationService.calculateLogisticsPrice(logisticsDTO);
                    
                case "SHIPPING_AGENCY":
                    ShippingAgencyRequestDTO agencyDTO = objectMapper.readValue(
                        request.getServiceData(), ShippingAgencyRequestDTO.class
                    );
                    return priceCalculationService.calculateShippingAgencyPrice(agencyDTO);
                    
                case "CHARTERING":
                    CharteringRequestDTO charteringDTO = objectMapper.readValue(
                        request.getServiceData(), CharteringRequestDTO.class
                    );
                    return priceCalculationService.calculateCharteringPrice(charteringDTO);
                    
                default:
                    throw new IllegalArgumentException("Unknown service type: " + request.getServiceType());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate price", e);
        }
    }
    
    private void saveQuotationItems(Long quotationId, List<PriceCalculationResult.PriceBreakdownItem> breakdown) {
        for (PriceCalculationResult.PriceBreakdownItem item : breakdown) {
            QuotationItem entity = QuotationItem.builder()
                .quotationId(quotationId)
                .itemCategory(item.getItemCategory())
                .itemName(item.getItemName())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .calculationNote(item.getCalculationNote())
                .displayOrder(item.getDisplayOrder())
                .isInternalOnly(true)
                .build();
            quotationItemRepository.save(entity);
        }
    }
    
    private void savePriceCalculations(Long quotationId, List<PriceCalculationResult.CalculationStep> steps) {
        for (PriceCalculationResult.CalculationStep step : steps) {
            PriceCalculation entity = PriceCalculation.builder()
                .quotationId(quotationId)
                .calculationStep(step.getCalculationStep())
                .componentName(step.getComponentName())
                .formulaUsed(step.getFormulaUsed())
                .inputValues(step.getInputValues())
                .baseValue(step.getBaseValue())
                .rateApplied(step.getRateApplied())
                .multiplier(step.getMultiplier())
                .calculatedValue(step.getCalculatedValue())
                .calculationNotes(step.getCalculationNotes())
                .stepOrder(step.getStepOrder())
                .build();
            priceCalculationRepository.save(entity);
        }
    }
    
    private String generateQuoteCode() {
        String dateCode = LocalDateTime.now().format(CODE_FORMATTER);
        long count = quotationRepository.count() + 1;
        return String.format("QT-%s-%04d", dateCode, count);
    }
    
    /**
     * Map to customer DTO - SANITIZED (FINAL PRICE ONLY)
     */
    private QuotationDTO mapToCustomerDTO(Quotation entity) {
        return QuotationDTO.builder()
            .id(entity.getId())
            .quoteCode(entity.getQuoteCode())
            .quoteDate(entity.getQuoteDate().toString())
            .validUntil(entity.getValidUntil().toString())
            .status(entity.getQuoteStatus())
            .serviceType(entity.getServiceType())
            // ONLY final amount - NO BREAKDOWN
            .finalAmount(entity.getFinalAmount())
            .currency(entity.getCurrency())
            .pdfUrl("/api/quotations/" + entity.getId() + "/pdf")
            .canAccept("SENT".equals(entity.getQuoteStatus()) && 
                      entity.getValidUntil().isAfter(LocalDate.now()))
            .canReject("SENT".equals(entity.getQuoteStatus()))
            .customerNotes(entity.getCustomerNotes())
            .customerResponse(entity.getCustomerResponse())
            .customerResponseDate(entity.getCustomerResponseDate() != null ? 
                entity.getCustomerResponseDate().toString() : null)
            .build();
    }
    
    /**
     * Map to internal DTO - FULL BREAKDOWN (EMPLOYEE/ADMIN ONLY)
     */
    private QuotationInternalDTO mapToInternalDTO(Quotation entity) {
        List<QuotationItem> items = quotationItemRepository.findByQuotationIdOrderByDisplayOrder(entity.getId());
        List<PriceCalculation> calculations = priceCalculationRepository.findByQuotationIdOrderByStepOrder(entity.getId());
        
        return QuotationInternalDTO.builder()
            .id(entity.getId())
            .quoteCode(entity.getQuoteCode())
            .requestId(entity.getRequestId())
            .customerId(entity.getCustomerId())
            .employeeId(entity.getEmployeeId())
            .serviceType(entity.getServiceType())
            .status(entity.getQuoteStatus())
            // FULL BREAKDOWN (INTERNAL ONLY)
            .basePrice(entity.getBasePrice())
            .totalSurcharges(entity.getTotalSurcharges())
            .totalDiscounts(entity.getTotalDiscounts())
            .subtotal(entity.getSubtotal())
            .taxAmount(entity.getTaxAmount())
            .finalAmount(entity.getFinalAmount())
            .currency(entity.getCurrency())
            .isPriceOverridden(entity.getIsPriceOverridden())
            .overrideReason(entity.getOverrideReason())
            .originalCalculatedPrice(entity.getOriginalCalculatedPrice())
            .quoteDate(entity.getQuoteDate().toString())
            .validUntil(entity.getValidUntil().toString())
            .sentAt(entity.getSentAt() != null ? entity.getSentAt().toString() : null)
            .customerResponse(entity.getCustomerResponse())
            .customerResponseDate(entity.getCustomerResponseDate() != null ? 
                entity.getCustomerResponseDate().toString() : null)
            .customerNotes(entity.getCustomerNotes())
            .items(items.stream().map(this::mapItemToDTO).collect(Collectors.toList()))
            .calculationSteps(calculations.stream().map(this::mapCalculationToDTO).collect(Collectors.toList()))
            .createdAt(entity.getCreatedAt().toString())
            .updatedAt(entity.getUpdatedAt().toString())
            .build();
    }
    
    private QuotationItemDTO mapItemToDTO(QuotationItem entity) {
        return QuotationItemDTO.builder()
            .id(entity.getId())
            .quotationId(entity.getQuotationId())
            .itemCategory(entity.getItemCategory())
            .itemName(entity.getItemName())
            .description(entity.getDescription())
            .quantity(entity.getQuantity())
            .unitPrice(entity.getUnitPrice())
            .totalPrice(entity.getTotalPrice())
            .calculationNote(entity.getCalculationNote())
            .displayOrder(entity.getDisplayOrder())
            .isInternalOnly(entity.getIsInternalOnly())
            .build();
    }
    
    private CalculationStepDTO mapCalculationToDTO(PriceCalculation entity) {
        return CalculationStepDTO.builder()
            .id(entity.getId())
            .quotationId(entity.getQuotationId())
            .calculationStep(entity.getCalculationStep())
            .componentName(entity.getComponentName())
            .formulaUsed(entity.getFormulaUsed())
            .baseValue(entity.getBaseValue())
            .rateApplied(entity.getRateApplied())
            .multiplier(entity.getMultiplier())
            .calculatedValue(entity.getCalculatedValue())
            .currency(entity.getCurrency())
            .calculationNotes(entity.getCalculationNotes())
            .stepOrder(entity.getStepOrder())
            .calculatedAt(entity.getCalculatedAt().toString())
            .build();
    }
}

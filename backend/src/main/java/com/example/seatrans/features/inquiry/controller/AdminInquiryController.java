package com.example.seatrans.features.inquiry.controller;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.inquiry.dto.CharteringBrokingInquiryResponse;
import com.example.seatrans.features.inquiry.dto.FreightForwardingInquiryResponse;
import com.example.seatrans.features.inquiry.dto.ShippingAgencyInquiryResponse;
import com.example.seatrans.features.inquiry.dto.SpecialRequestInquiryResponse;
import com.example.seatrans.features.inquiry.dto.TotalLogisticInquiryResponse;
import com.example.seatrans.features.inquiry.model.CharteringBrokingInquiry;
import com.example.seatrans.features.inquiry.model.FreightForwardingInquiry;
import com.example.seatrans.features.inquiry.model.InquiryStatus;
import com.example.seatrans.features.inquiry.model.ShippingAgencyInquiry;
import com.example.seatrans.features.inquiry.model.SpecialRequestInquiry;
import com.example.seatrans.features.inquiry.model.TotalLogisticInquiry;
import com.example.seatrans.features.inquiry.repository.CharteringBrokingInquiryRepository;
import com.example.seatrans.features.inquiry.repository.FreightForwardingInquiryRepository;
import com.example.seatrans.features.inquiry.repository.ShippingAgencyInquiryRepository;
import com.example.seatrans.features.inquiry.repository.SpecialRequestInquiryRepository;
import com.example.seatrans.features.inquiry.repository.TotalLogisticInquiryRepository;
import com.example.seatrans.features.inquiry.service.InquiryDocumentService;
import com.example.seatrans.features.inquiry.service.InquiryResponseEnricher;
import com.example.seatrans.features.logistics.model.ServiceTypeEntity;
import com.example.seatrans.features.logistics.repository.ServiceTypeRepository;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/admin/inquiries")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLOYEE','ROLE_INTERNAL')")
@Slf4j
public class AdminInquiryController {

    private final ShippingAgencyInquiryRepository shippingAgencyInquiryRepository;
    private final CharteringBrokingInquiryRepository charteringBrokingInquiryRepository;
    private final FreightForwardingInquiryRepository freightForwardingInquiryRepository;
    private final SpecialRequestInquiryRepository specialRequestInquiryRepository;
    private final TotalLogisticInquiryRepository totalLogisticInquiryRepository;
    private final InquiryResponseEnricher enricher;
    private final InquiryDocumentService inquiryDocumentService;
    private final ServiceTypeRepository serviceTypeRepository;

    private static final String SHIPPING_AGENCY = "SHIPPING AGENCY";
    private static final String CHARTERING = "CHARTERING";
    private static final String FREIGHT_FORWARDING = "FREIGHT FORWARDING";
    private static final String LOGISTICS = "LOGISTICS";
    private static final String SPECIAL_REQUEST = "SPECIAL REQUEST";

    public AdminInquiryController(ShippingAgencyInquiryRepository shippingAgencyInquiryRepository,
                                  CharteringBrokingInquiryRepository charteringBrokingInquiryRepository,
                                  FreightForwardingInquiryRepository freightForwardingInquiryRepository,
                                  SpecialRequestInquiryRepository specialRequestInquiryRepository,
                                  TotalLogisticInquiryRepository totalLogisticInquiryRepository,
                                  InquiryResponseEnricher enricher,
                                  InquiryDocumentService inquiryDocumentService,
                                  ServiceTypeRepository serviceTypeRepository) {
        this.shippingAgencyInquiryRepository = shippingAgencyInquiryRepository;
        this.charteringBrokingInquiryRepository = charteringBrokingInquiryRepository;
        this.freightForwardingInquiryRepository = freightForwardingInquiryRepository;
        this.specialRequestInquiryRepository = specialRequestInquiryRepository;
        this.totalLogisticInquiryRepository = totalLogisticInquiryRepository;
        this.enricher = enricher;
        this.inquiryDocumentService = inquiryDocumentService;
        this.serviceTypeRepository = serviceTypeRepository;
    }

    // Quick filters per service for admin UI compatibility
    @GetMapping("/shipping-agency/inquiries")
    public ResponseEntity<?> shippingAgency(@RequestParam(value = "status", required = false) InquiryStatus status,
                                            @RequestParam(value = "page", defaultValue = "0") int page,
                                            @RequestParam(value = "size", defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        Page<ShippingAgencyInquiry> result = (status != null)
            ? shippingAgencyInquiryRepository.findByStatus(status, pageable)
            : shippingAgencyInquiryRepository.findAll(pageable);
        return ResponseEntity.ok(result.map(ShippingAgencyInquiryResponse::from).map(enricher::enrichShippingAgency));
    }

    @GetMapping("/chartering/inquiries")
    public ResponseEntity<?> chartering(@RequestParam(value = "status", required = false) InquiryStatus status,
                                        @RequestParam(value = "page", defaultValue = "0") int page,
                                        @RequestParam(value = "size", defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        Page<CharteringBrokingInquiry> result = (status != null)
            ? charteringBrokingInquiryRepository.findByStatus(status, pageable)
            : charteringBrokingInquiryRepository.findAll(pageable);
        return ResponseEntity.ok(result.map(CharteringBrokingInquiryResponse::from).map(enricher::enrichChartering));
    }

    @GetMapping("/freight-forwarding/inquiries")
    public ResponseEntity<?> freight(@RequestParam(value = "status", required = false) InquiryStatus status,
                                     @RequestParam(value = "page", defaultValue = "0") int page,
                                     @RequestParam(value = "size", defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        Page<FreightForwardingInquiry> result = (status != null)
            ? freightForwardingInquiryRepository.findByStatus(status, pageable)
            : freightForwardingInquiryRepository.findAll(pageable);
        return ResponseEntity.ok(result.map(FreightForwardingInquiryResponse::from).map(enricher::enrichFreightForwarding));
    }

    @GetMapping("/logistics/inquiries")
    public ResponseEntity<?> logistics(@RequestParam(value = "status", required = false) InquiryStatus status,
                                       @RequestParam(value = "page", defaultValue = "0") int page,
                                       @RequestParam(value = "size", defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        Page<TotalLogisticInquiry> result = (status != null)
            ? totalLogisticInquiryRepository.findByStatus(status, pageable)
            : totalLogisticInquiryRepository.findAll(pageable);
        return ResponseEntity.ok(result.map(TotalLogisticInquiryResponse::from).map(enricher::enrichLogistics));
    }

    @GetMapping("/special-request/inquiries")
    public ResponseEntity<?> specialRequest(@RequestParam(value = "status", required = false) InquiryStatus status,
                                            @RequestParam(value = "page", defaultValue = "0") int page,
                                            @RequestParam(value = "size", defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        Page<SpecialRequestInquiry> result = (status != null)
            ? specialRequestInquiryRepository.findByStatus(status, pageable)
            : specialRequestInquiryRepository.findAll(pageable);
        return ResponseEntity.ok(result.map(SpecialRequestInquiryResponse::from).map(enricher::enrichSpecialRequest));
    }

    @GetMapping
    public ResponseEntity<?> getInquiries(
            @RequestParam(value = "serviceType") String serviceTypeName,
            @RequestParam(value = "status", required = false) InquiryStatus status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        return fetchPage(serviceTypeName, status, pageable);
    }

    @GetMapping("/{serviceType}")
    public ResponseEntity<?> getInquiriesByType(
            @PathVariable("serviceType") String serviceTypeName,
            @RequestParam(value = "status", required = false) InquiryStatus status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        return fetchPage(serviceTypeName, status, pageable);
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecent(@RequestParam("serviceType") String serviceTypeName) {
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "submittedAt"));
        return fetchPage(serviceTypeName, null, pageable);
    }

    @DeleteMapping("/{serviceType}/{id}")
    public ResponseEntity<Void> deleteInquiry(@PathVariable("serviceType") String serviceTypeName, @PathVariable Long id) {
        try {
            boolean deleted = deleteByService(serviceTypeName, id);
            return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
        } catch (Exception ex) {
            log.error("Failed to delete inquiry and documents: serviceType={}, id={}", serviceTypeName, id, ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{serviceType}/{id}")
    public ResponseEntity<?> getInquiry(@PathVariable("serviceType") String serviceTypeName, @PathVariable Long id) {
        return fetchOne(serviceTypeName, id);
    }

    @PatchMapping("/{serviceType}/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable("serviceType") String serviceTypeName,
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request) {
        return updateStatusByService(serviceTypeName, id, request.status());
    }

    @PatchMapping("/{serviceType}/{id}/form")
    public ResponseEntity<?> updateQuoteForm(
            @PathVariable("serviceType") String serviceTypeName,
            @PathVariable Long id,
            @RequestBody UpdateFormRequest request) {
        ServiceTypeEntity serviceType;
        try {
            serviceType = resolveServiceTypeByName(serviceTypeName);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
        if (!SHIPPING_AGENCY.equals(serviceType.getName())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Quote form update only supported for shipping agency"));
        }
        return shippingAgencyInquiryRepository.findById(id)
            .map(inquiry -> {
                inquiry.setQuoteForm(request.form());
                return ResponseEntity.ok(shippingAgencyInquiryRepository.save(inquiry));
            }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{serviceType}/{id}/hours")
    public ResponseEntity<?> updateQuoteHours(
            @PathVariable("serviceType") String serviceTypeName,
            @PathVariable Long id,
            @RequestBody UpdateHoursRequest request) {
        ServiceTypeEntity serviceType;
        try {
            serviceType = resolveServiceTypeByName(serviceTypeName);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
        if (!SHIPPING_AGENCY.equals(serviceType.getName())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hours update only supported for shipping agency"));
        }
        return shippingAgencyInquiryRepository.findById(id)
            .map(inquiry -> {
                if (request.berthHours() != null) {
                    inquiry.setBerthHours(request.berthHours());
                }
                if (request.anchorageHours() != null) {
                    inquiry.setAnchorageHours(request.anchorageHours());
                }
                if (request.pilotage3rdMiles() != null) {
                    inquiry.setPilotage3rdMiles(request.pilotage3rdMiles());
                }
                return ResponseEntity.ok(shippingAgencyInquiryRepository.save(inquiry));
            }).orElse(ResponseEntity.notFound().build());
    }

    public record UpdateStatusRequest(InquiryStatus status) {}
    public record UpdateFormRequest(String form) {}
    public record UpdateHoursRequest(BigDecimal berthHours, BigDecimal anchorageHours, BigDecimal pilotage3rdMiles) {}

    private ResponseEntity<?> fetchPage(String serviceTypeName, InquiryStatus status, Pageable pageable) {
        ServiceTypeEntity serviceType;
        try {
            serviceType = resolveServiceTypeByName(serviceTypeName);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }

        return switch (serviceType.getName()) {
            case SHIPPING_AGENCY -> {
                Page<ShippingAgencyInquiry> result = status != null
                    ? shippingAgencyInquiryRepository.findByStatus(status, pageable)
                    : shippingAgencyInquiryRepository.findAll(pageable);
                yield ResponseEntity.ok(result.map(ShippingAgencyInquiryResponse::from).map(enricher::enrichShippingAgency));
            }
            case CHARTERING -> {
                Page<CharteringBrokingInquiry> result = status != null
                    ? charteringBrokingInquiryRepository.findByStatus(status, pageable)
                    : charteringBrokingInquiryRepository.findAll(pageable);
                yield ResponseEntity.ok(result.map(CharteringBrokingInquiryResponse::from).map(enricher::enrichChartering));
            }
            case FREIGHT_FORWARDING -> {
                Page<FreightForwardingInquiry> result = status != null
                    ? freightForwardingInquiryRepository.findByStatus(status, pageable)
                    : freightForwardingInquiryRepository.findAll(pageable);
                yield ResponseEntity.ok(result.map(FreightForwardingInquiryResponse::from).map(enricher::enrichFreightForwarding));
            }
            case LOGISTICS -> {
                Page<TotalLogisticInquiry> result = status != null
                    ? totalLogisticInquiryRepository.findByStatus(status, pageable)
                    : totalLogisticInquiryRepository.findAll(pageable);
                yield ResponseEntity.ok(result.map(TotalLogisticInquiryResponse::from).map(enricher::enrichLogistics));
            }
            case SPECIAL_REQUEST -> {
                Page<SpecialRequestInquiry> result = status != null
                    ? specialRequestInquiryRepository.findByStatus(status, pageable)
                    : specialRequestInquiryRepository.findAll(pageable);
                yield ResponseEntity.ok(result.map(SpecialRequestInquiryResponse::from).map(enricher::enrichSpecialRequest));
            }
            default -> ResponseEntity.badRequest().body(Map.of("message", "Unsupported service type: " + serviceType.getName()));
        };
    }

    private ResponseEntity<?> fetchOne(String serviceTypeName, Long id) {
        ServiceTypeEntity serviceType;
        try {
            serviceType = resolveServiceTypeByName(serviceTypeName);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }

        return switch (serviceType.getName()) {
            case SHIPPING_AGENCY -> shippingAgencyInquiryRepository.findById(id)
                .map(ShippingAgencyInquiryResponse::from)
                .map(enricher::enrichShippingAgency)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
            case CHARTERING -> charteringBrokingInquiryRepository.findById(id)
                .map(CharteringBrokingInquiryResponse::from)
                .map(enricher::enrichChartering)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
            case FREIGHT_FORWARDING -> freightForwardingInquiryRepository.findById(id)
                .map(FreightForwardingInquiryResponse::from)
                .map(enricher::enrichFreightForwarding)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
            case LOGISTICS -> totalLogisticInquiryRepository.findById(id)
                .map(TotalLogisticInquiryResponse::from)
                .map(enricher::enrichLogistics)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
            case SPECIAL_REQUEST -> specialRequestInquiryRepository.findById(id)
                .map(SpecialRequestInquiryResponse::from)
                .map(enricher::enrichSpecialRequest)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
            default -> ResponseEntity.badRequest().body(Map.of("message", "Unsupported service type: " + serviceType.getName()));
        };
    }

    private ResponseEntity<?> updateStatusByService(String serviceTypeName, Long id, InquiryStatus status) {
        if (status == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));
        }
        ServiceTypeEntity serviceType;
        try {
            serviceType = resolveServiceTypeByName(serviceTypeName);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }

        return switch (serviceType.getName()) {
            case SHIPPING_AGENCY -> shippingAgencyInquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setStatus(status);
                    return ResponseEntity.ok(shippingAgencyInquiryRepository.save(inquiry));
                }).orElse(ResponseEntity.notFound().build());
            case CHARTERING -> charteringBrokingInquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setStatus(status);
                    return ResponseEntity.ok(charteringBrokingInquiryRepository.save(inquiry));
                }).orElse(ResponseEntity.notFound().build());
            case FREIGHT_FORWARDING -> freightForwardingInquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setStatus(status);
                    return ResponseEntity.ok(freightForwardingInquiryRepository.save(inquiry));
                }).orElse(ResponseEntity.notFound().build());
            case LOGISTICS -> totalLogisticInquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setStatus(status);
                    return ResponseEntity.ok(totalLogisticInquiryRepository.save(inquiry));
                }).orElse(ResponseEntity.notFound().build());
            case SPECIAL_REQUEST -> specialRequestInquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setStatus(status);
                    return ResponseEntity.ok(specialRequestInquiryRepository.save(inquiry));
                }).orElse(ResponseEntity.notFound().build());
            default -> ResponseEntity.badRequest().body(Map.of("message", "Unsupported service type: " + serviceType.getName()));
        };
    }

    private boolean deleteByService(String serviceTypeName, Long id) throws Exception {
        ServiceTypeEntity serviceType = resolveServiceTypeByName(serviceTypeName);

        boolean deleted = switch (serviceType.getName()) {
            case SHIPPING_AGENCY -> deleteIfExists(shippingAgencyInquiryRepository, id);
            case CHARTERING -> deleteIfExists(charteringBrokingInquiryRepository, id);
            case FREIGHT_FORWARDING -> deleteIfExists(freightForwardingInquiryRepository, id);
            case LOGISTICS -> deleteIfExists(totalLogisticInquiryRepository, id);
            case SPECIAL_REQUEST -> deleteIfExists(specialRequestInquiryRepository, id);
            default -> false;
        };

        if (deleted) {
            // Clean up any attached documents (Cloudinary + DB)
            inquiryDocumentService.hardDeleteByServiceAndTarget(serviceType.getName(), id);
        }

        return deleted;
    }

    private <T, R extends org.springframework.data.jpa.repository.JpaRepository<T, Long>> boolean deleteIfExists(R repository, Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    private ServiceTypeEntity resolveServiceTypeByName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("serviceType is required");
        }
        return serviceTypeRepository.findByName(name.trim())
                .orElseThrow(() -> new IllegalArgumentException("Unsupported service type: " + name));
    }
}

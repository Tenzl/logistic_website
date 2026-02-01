package com.example.seatrans.features.inquiry.controller;

import java.math.BigDecimal;
import java.util.List;
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
import com.example.seatrans.features.inquiry.service.InquiryResponseEnricher;

@RestController
@RequestMapping("/api/v1/admin/inquiries")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLOYEE','ROLE_INTERNAL')")
public class AdminInquiryController {

    private final ShippingAgencyInquiryRepository shippingAgencyInquiryRepository;
    private final CharteringBrokingInquiryRepository charteringBrokingInquiryRepository;
    private final FreightForwardingInquiryRepository freightForwardingInquiryRepository;
    private final SpecialRequestInquiryRepository specialRequestInquiryRepository;
    private final TotalLogisticInquiryRepository totalLogisticInquiryRepository;
    private final InquiryResponseEnricher enricher;

    public AdminInquiryController(ShippingAgencyInquiryRepository shippingAgencyInquiryRepository,
                                  CharteringBrokingInquiryRepository charteringBrokingInquiryRepository,
                                  FreightForwardingInquiryRepository freightForwardingInquiryRepository,
                                  SpecialRequestInquiryRepository specialRequestInquiryRepository,
                                  TotalLogisticInquiryRepository totalLogisticInquiryRepository,
                                  InquiryResponseEnricher enricher) {
        this.shippingAgencyInquiryRepository = shippingAgencyInquiryRepository;
        this.charteringBrokingInquiryRepository = charteringBrokingInquiryRepository;
        this.freightForwardingInquiryRepository = freightForwardingInquiryRepository;
        this.specialRequestInquiryRepository = specialRequestInquiryRepository;
        this.totalLogisticInquiryRepository = totalLogisticInquiryRepository;
        this.enricher = enricher;
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
            @RequestParam(value = "serviceSlug", required = false) String serviceSlug,
            @RequestParam(value = "serviceType", required = false) String serviceType,
            @RequestParam(value = "status", required = false) InquiryStatus status,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        String resolvedSlug = serviceSlug != null && !serviceSlug.isBlank() ? serviceSlug : serviceType;
        if (resolvedSlug == null || resolvedSlug.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "serviceSlug (or serviceType) is required"));
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        return fetchPage(resolvedSlug, status, userId, pageable);
    }

    @GetMapping("/{serviceSlug}")
    public ResponseEntity<?> getInquiriesBySlug(
            @PathVariable String serviceSlug,
            @RequestParam(value = "status", required = false) InquiryStatus status,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        return fetchPage(serviceSlug, status, userId, pageable);
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecent(@RequestParam("serviceSlug") String serviceSlug) {
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "submittedAt"));
        return fetchPage(serviceSlug, null, null, pageable);
    }

    @DeleteMapping("/{serviceSlug}/{id}")
    public ResponseEntity<Void> deleteInquiry(@PathVariable String serviceSlug, @PathVariable Long id) {
        boolean deleted = deleteByService(serviceSlug, id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/batch")
    public ResponseEntity<?> deleteInquiries(@RequestBody BatchDeleteRequest request) {
        if (request == null || request.ids() == null || request.ids().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "ids are required"));
        }

        int deletedCount = 0;
        for (Long id : request.ids()) {
            if (deleteByAnyService(id)) {
                deletedCount++;
            }
        }

        return ResponseEntity.ok(Map.of(
            "deleted", deletedCount,
            "requested", request.ids().size()
        ));
    }

    @GetMapping("/{serviceSlug}/{id}")
    public ResponseEntity<?> getInquiry(@PathVariable String serviceSlug, @PathVariable Long id) {
        return fetchOne(serviceSlug, id);
    }

    @PatchMapping("/{serviceSlug}/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String serviceSlug,
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request) {
        return updateStatusByService(serviceSlug, id, request.status());
    }

    @PatchMapping("/{serviceSlug}/{id}/form")
    public ResponseEntity<?> updateQuoteForm(
            @PathVariable String serviceSlug,
            @PathVariable Long id,
            @RequestBody UpdateFormRequest request) {
        String normalized = normalize(serviceSlug);
        if (!"shipping-agency".equals(normalized)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Quote form update only supported for shipping-agency"));
        }
        return shippingAgencyInquiryRepository.findById(id)
            .map(inquiry -> {
                inquiry.setQuoteForm(request.form());
                return ResponseEntity.ok(shippingAgencyInquiryRepository.save(inquiry));
            }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{serviceSlug}/{id}/hours")
    public ResponseEntity<?> updateQuoteHours(
            @PathVariable String serviceSlug,
            @PathVariable Long id,
            @RequestBody UpdateHoursRequest request) {
        String normalized = normalize(serviceSlug);
        if (!"shipping-agency".equals(normalized)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hours update only supported for shipping-agency"));
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
    public record BatchDeleteRequest(List<Long> ids) {}

    private ResponseEntity<?> fetchPage(String serviceSlug, InquiryStatus status, Long userId, Pageable pageable) {
        String normalized = normalize(serviceSlug);
        return switch (normalized) {
            case "shipping-agency" -> {
                Page<ShippingAgencyInquiry> result = resolveShippingAgencyPage(status, userId, pageable);
                yield ResponseEntity.ok(result.map(ShippingAgencyInquiryResponse::from).map(enricher::enrichShippingAgency));
            }
            case "chartering-ship-broking" -> {
                Page<CharteringBrokingInquiry> result = resolveCharteringPage(status, userId, pageable);
                yield ResponseEntity.ok(result.map(CharteringBrokingInquiryResponse::from).map(enricher::enrichChartering));
            }
            case "freight-forwarding" -> {
                Page<FreightForwardingInquiry> result = resolveFreightPage(status, userId, pageable);
                yield ResponseEntity.ok(result.map(FreightForwardingInquiryResponse::from).map(enricher::enrichFreightForwarding));
            }
            case "total-logistics" -> {
                Page<TotalLogisticInquiry> result = resolveLogisticsPage(status, userId, pageable);
                yield ResponseEntity.ok(result.map(TotalLogisticInquiryResponse::from).map(enricher::enrichLogistics));
            }
            case "special-request" -> {
                Page<SpecialRequestInquiry> result = resolveSpecialRequestPage(status, userId, pageable);
                yield ResponseEntity.ok(result.map(SpecialRequestInquiryResponse::from).map(enricher::enrichSpecialRequest));
            }
            default -> ResponseEntity.badRequest().body(Map.of("message", "Unsupported service slug: " + serviceSlug));
        };
    }

    private Page<ShippingAgencyInquiry> resolveShippingAgencyPage(InquiryStatus status, Long userId, Pageable pageable) {
        if (userId != null && status != null) {
            return shippingAgencyInquiryRepository.findByUserIdAndStatus(userId, status, pageable);
        }
        if (userId != null) {
            return shippingAgencyInquiryRepository.findByUserId(userId, pageable);
        }
        if (status != null) {
            return shippingAgencyInquiryRepository.findByStatus(status, pageable);
        }
        return shippingAgencyInquiryRepository.findAll(pageable);
    }

    private Page<CharteringBrokingInquiry> resolveCharteringPage(InquiryStatus status, Long userId, Pageable pageable) {
        if (userId != null && status != null) {
            return charteringBrokingInquiryRepository.findByUserIdAndStatus(userId, status, pageable);
        }
        if (userId != null) {
            return charteringBrokingInquiryRepository.findByUserId(userId, pageable);
        }
        if (status != null) {
            return charteringBrokingInquiryRepository.findByStatus(status, pageable);
        }
        return charteringBrokingInquiryRepository.findAll(pageable);
    }

    private Page<FreightForwardingInquiry> resolveFreightPage(InquiryStatus status, Long userId, Pageable pageable) {
        if (userId != null && status != null) {
            return freightForwardingInquiryRepository.findByUserIdAndStatus(userId, status, pageable);
        }
        if (userId != null) {
            return freightForwardingInquiryRepository.findByUserId(userId, pageable);
        }
        if (status != null) {
            return freightForwardingInquiryRepository.findByStatus(status, pageable);
        }
        return freightForwardingInquiryRepository.findAll(pageable);
    }

    private Page<TotalLogisticInquiry> resolveLogisticsPage(InquiryStatus status, Long userId, Pageable pageable) {
        if (userId != null && status != null) {
            return totalLogisticInquiryRepository.findByUserIdAndStatus(userId, status, pageable);
        }
        if (userId != null) {
            return totalLogisticInquiryRepository.findByUserId(userId, pageable);
        }
        if (status != null) {
            return totalLogisticInquiryRepository.findByStatus(status, pageable);
        }
        return totalLogisticInquiryRepository.findAll(pageable);
    }

    private Page<SpecialRequestInquiry> resolveSpecialRequestPage(InquiryStatus status, Long userId, Pageable pageable) {
        if (userId != null && status != null) {
            return specialRequestInquiryRepository.findByUserIdAndStatus(userId, status, pageable);
        }
        if (userId != null) {
            return specialRequestInquiryRepository.findByUserId(userId, pageable);
        }
        if (status != null) {
            return specialRequestInquiryRepository.findByStatus(status, pageable);
        }
        return specialRequestInquiryRepository.findAll(pageable);
    }

    private ResponseEntity<?> fetchOne(String serviceSlug, Long id) {
        String normalized = normalize(serviceSlug);
        try {
            return switch (normalized) {
                case "shipping-agency" -> shippingAgencyInquiryRepository.findById(id)
                    .map(ShippingAgencyInquiryResponse::from)
                    .map(enricher::enrichShippingAgency)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
                case "chartering-ship-broking" -> charteringBrokingInquiryRepository.findById(id)
                    .map(CharteringBrokingInquiryResponse::from)
                    .map(enricher::enrichChartering)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
                case "freight-forwarding" -> freightForwardingInquiryRepository.findById(id)
                    .map(FreightForwardingInquiryResponse::from)
                    .map(enricher::enrichFreightForwarding)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
                case "total-logistics" -> totalLogisticInquiryRepository.findById(id)
                    .map(TotalLogisticInquiryResponse::from)
                    .map(enricher::enrichLogistics)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
                case "special-request" -> specialRequestInquiryRepository.findById(id)
                    .map(SpecialRequestInquiryResponse::from)
                    .map(enricher::enrichSpecialRequest)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
                default -> ResponseEntity.notFound().build();
            };
        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("Error fetching inquiry: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error", "message", e.getMessage()));
        }
    }

    private ResponseEntity<?> updateStatusByService(String serviceSlug, Long id, InquiryStatus status) {
        if (status == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));
        }
        String normalized = normalize(serviceSlug);
        return switch (normalized) {
            case "shipping-agency" -> shippingAgencyInquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setStatus(status);
                    return ResponseEntity.ok(shippingAgencyInquiryRepository.save(inquiry));
                }).orElse(ResponseEntity.notFound().build());
            case "chartering-ship-broking" -> charteringBrokingInquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setStatus(status);
                    return ResponseEntity.ok(charteringBrokingInquiryRepository.save(inquiry));
                }).orElse(ResponseEntity.notFound().build());
            case "freight-forwarding" -> freightForwardingInquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setStatus(status);
                    return ResponseEntity.ok(freightForwardingInquiryRepository.save(inquiry));
                }).orElse(ResponseEntity.notFound().build());
            case "total-logistics" -> totalLogisticInquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setStatus(status);
                    return ResponseEntity.ok(totalLogisticInquiryRepository.save(inquiry));
                }).orElse(ResponseEntity.notFound().build());
            case "special-request" -> specialRequestInquiryRepository.findById(id)
                .map(inquiry -> {
                    inquiry.setStatus(status);
                    return ResponseEntity.ok(specialRequestInquiryRepository.save(inquiry));
                }).orElse(ResponseEntity.notFound().build());
            default -> ResponseEntity.badRequest().body(Map.of("message", "Unsupported service slug: " + serviceSlug));
        };
    }

    private boolean deleteByService(String serviceSlug, Long id) {
        String normalized = normalize(serviceSlug);
        return switch (normalized) {
            case "shipping-agency" -> deleteIfExists(shippingAgencyInquiryRepository, id);
            case "chartering-ship-broking" -> deleteIfExists(charteringBrokingInquiryRepository, id);
            case "freight-forwarding" -> deleteIfExists(freightForwardingInquiryRepository, id);
            case "total-logistics" -> deleteIfExists(totalLogisticInquiryRepository, id);
            case "special-request" -> deleteIfExists(specialRequestInquiryRepository, id);
            default -> false;
        };
    }

    private boolean deleteByAnyService(Long id) {
        boolean deleted = deleteIfExists(shippingAgencyInquiryRepository, id);
        deleted = deleteIfExists(charteringBrokingInquiryRepository, id) || deleted;
        deleted = deleteIfExists(freightForwardingInquiryRepository, id) || deleted;
        deleted = deleteIfExists(totalLogisticInquiryRepository, id) || deleted;
        deleted = deleteIfExists(specialRequestInquiryRepository, id) || deleted;
        return deleted;
    }

    private <T, R extends org.springframework.data.jpa.repository.JpaRepository<T, Long>> boolean deleteIfExists(R repository, Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    /**
     * Normalize and resolve service slug aliases to canonical slugs.
     * Supports short aliases for convenience:
     * - "chartering" -> "chartering-ship-broking"
     * - "logistics" -> "total-logistics"
     * - "freight" -> "freight-forwarding"
     * - "shipping" -> "shipping-agency"
     * - "special" -> "special-request"
     */
    private String normalize(String value) {
        if (value == null) return "";
        String normalized = value.trim().toLowerCase();
        
        // Map short aliases to canonical slugs
        return switch (normalized) {
            case "chartering" -> "chartering-ship-broking";
            case "logistics" -> "total-logistics";
            case "total-logistic" -> "total-logistics";
            case "freight" -> "freight-forwarding";
            case "shipping" -> "shipping-agency";
            case "special" -> "special-request";
            default -> normalized;
        };
    }
}

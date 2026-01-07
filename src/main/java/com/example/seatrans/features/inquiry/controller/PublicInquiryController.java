package com.example.seatrans.features.inquiry.controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.seatrans.features.auth.service.UserService;
import com.example.seatrans.features.inquiry.dto.CharteringBrokingInquiryResponse;
import com.example.seatrans.features.inquiry.dto.FreightForwardingInquiryResponse;
import com.example.seatrans.features.inquiry.dto.PublicInquiryRequest;
import com.example.seatrans.features.inquiry.dto.ShippingAgencyInquiryResponse;
import com.example.seatrans.features.inquiry.dto.SpecialRequestInquiryResponse;
import com.example.seatrans.features.inquiry.dto.TotalLogisticInquiryResponse;
import com.example.seatrans.features.inquiry.model.CharteringBrokingInquiry;
import com.example.seatrans.features.inquiry.model.FreightForwardingInquiry;
import com.example.seatrans.features.inquiry.model.InquiryDocument.DocumentType;
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
import com.example.seatrans.features.logistics.repository.PortRepository;
import com.example.seatrans.features.logistics.repository.ProvinceRepository;
import com.example.seatrans.features.logistics.repository.ServiceTypeRepository;
import com.example.seatrans.shared.exception.DuplicateUserException;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/inquiries")
@Validated
public class PublicInquiryController {

    private final ShippingAgencyInquiryRepository shippingAgencyInquiryRepository;
    private final CharteringBrokingInquiryRepository charteringBrokingInquiryRepository;
    private final FreightForwardingInquiryRepository freightForwardingInquiryRepository;
    private final SpecialRequestInquiryRepository specialRequestInquiryRepository;
    private final TotalLogisticInquiryRepository totalLogisticInquiryRepository;
    private final InquiryDocumentService documentService;
    private final UserService userService;
    private final ServiceTypeRepository serviceTypeRepository;
    private final PortRepository portRepository;
    private final ProvinceRepository provinceRepository;
    private final ObjectMapper objectMapper;

    public PublicInquiryController(
            ShippingAgencyInquiryRepository shippingAgencyInquiryRepository,
            CharteringBrokingInquiryRepository charteringBrokingInquiryRepository,
            FreightForwardingInquiryRepository freightForwardingInquiryRepository,
            SpecialRequestInquiryRepository specialRequestInquiryRepository,
            TotalLogisticInquiryRepository totalLogisticInquiryRepository,
            InquiryDocumentService documentService,
            UserService userService,
            ServiceTypeRepository serviceTypeRepository,
            PortRepository portRepository,
            ProvinceRepository provinceRepository,
            ObjectMapper objectMapper) {
        this.shippingAgencyInquiryRepository = shippingAgencyInquiryRepository;
        this.charteringBrokingInquiryRepository = charteringBrokingInquiryRepository;
        this.freightForwardingInquiryRepository = freightForwardingInquiryRepository;
        this.specialRequestInquiryRepository = specialRequestInquiryRepository;
        this.totalLogisticInquiryRepository = totalLogisticInquiryRepository;
        this.documentService = documentService;
        this.userService = userService;
        this.serviceTypeRepository = serviceTypeRepository;
        this.portRepository = portRepository;
        this.provinceRepository = provinceRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * GET /api/inquiries/user/{userId}
     * Get all inquiries for a specific user (authenticated users only)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getInquiriesByUser(
            @PathVariable Long userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {

        Pageable pageable = Pageable.unpaged();

        // Aggregate all inquiries of the user, newest first
        var shippingAgency = shippingAgencyInquiryRepository.findByUserId(userId, pageable).getContent();
        var chartering = charteringBrokingInquiryRepository.findByUserId(userId, pageable).getContent();
        var freight = freightForwardingInquiryRepository.findByUserId(userId, pageable).getContent();
        var logistics = totalLogisticInquiryRepository.findByUserId(userId, pageable).getContent();
        var special = specialRequestInquiryRepository.findByUserId(userId, pageable).getContent();

        List<Map<String, Object>> all = new ArrayList<>();
        shippingAgency.forEach(i -> {
            ShippingAgencyInquiryResponse dto = ShippingAgencyInquiryResponse.from(i);
            Map<String, Object> item = objectMapper.convertValue(dto, Map.class);
            item.put("serviceType", Map.of(
                "id", 1,
                "name", "shipping-agency",
                "displayName", "Shipping Agency"
            ));
            all.add(item);
        });
        chartering.forEach(i -> {
            CharteringBrokingInquiryResponse dto = CharteringBrokingInquiryResponse.from(i);
            Map<String, Object> item = objectMapper.convertValue(dto, Map.class);
            item.put("serviceType", Map.of(
                "id", 2,
                "name", "chartering",
                "displayName", "Chartering & Broking"
            ));
            all.add(item);
        });
        freight.forEach(i -> {
            FreightForwardingInquiryResponse dto = FreightForwardingInquiryResponse.from(i);
            Map<String, Object> item = objectMapper.convertValue(dto, Map.class);
            item.put("serviceType", Map.of(
                "id", 3,
                "name", "freight-forwarding",
                "displayName", "Freight Forwarding"
            ));
            all.add(item);
        });
        logistics.forEach(i -> {
            TotalLogisticInquiryResponse dto = TotalLogisticInquiryResponse.from(i);
            Map<String, Object> item = objectMapper.convertValue(dto, Map.class);
            item.put("serviceType", Map.of(
                "id", 4,
                "name", "total-logistics",
                "displayName", "Total Logistics"
            ));
            all.add(item);
        });
        special.forEach(i -> {
            SpecialRequestInquiryResponse dto = SpecialRequestInquiryResponse.from(i);
            Map<String, Object> item = objectMapper.convertValue(dto, Map.class);
            item.put("serviceType", Map.of(
                "id", 5,
                "name", "special-request",
                "displayName", "Special Request"
            ));
            all.add(item);
        });

        // Sort by submittedAt descending
        all.sort((a, b) -> {
            String aTime = (String) a.get("submittedAt");
            String bTime = (String) b.get("submittedAt");
            return bTime.compareTo(aTime);
        });

        // Simple page slice
        int from = Math.min(page * size, all.size());
        int to = Math.min(from + size, all.size());
        List<Map<String, Object>> slice = all.subList(from, to);
        int totalPages = (int) Math.ceil(all.size() / (double) size);

        return ResponseEntity.ok(Map.of(
            "content", slice,
            "totalElements", all.size(),
            "totalPages", totalPages,
            "size", size,
            "number", page
        ));
    }

    @GetMapping
    public ResponseEntity<?> listPublic(
            @RequestParam("serviceSlug") String serviceSlug,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        return fetchPage(serviceSlug, pageable);
    }

    @GetMapping("/{serviceSlug}")
    public ResponseEntity<?> listPublicByPath(
            @PathVariable String serviceSlug,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        return fetchPage(serviceSlug, pageable);
    }

        @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> submitPublicInquiry(
            @RequestPart("inquiry") @Validated PublicInquiryRequest request,
            @RequestPart(value = "files", required = false) MultipartFile[] files,
            @AuthenticationPrincipal java.security.Principal principal) {
        return handleSubmit(request, files, principal, null);
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> submitPublicInquiryJson(
            @RequestBody @Validated PublicInquiryRequest request,
            @AuthenticationPrincipal java.security.Principal principal) {
        return handleSubmit(request, null, principal, null);
    }

    private ResponseEntity<?> handleSubmit(
            PublicInquiryRequest request,
            MultipartFile[] files,
            java.security.Principal principal,
            String serviceSlugOverride) {

        // Resolve service type by ID or name/slug
        if (serviceSlugOverride != null) {
            request.setServiceTypeSlug(serviceSlugOverride);
        }

        var serviceType = request.getServiceTypeId() != null
            ? serviceTypeRepository.findById(request.getServiceTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid service type ID"))
            : serviceTypeRepository.findByName(request.getServiceTypeSlug())
                .orElseThrow(() -> new IllegalArgumentException("Invalid service type: " + request.getServiceTypeSlug()));

        java.security.Principal authPrincipal = principal;
        com.example.seatrans.features.auth.model.User currentUser = null;
        boolean isGuestFlow = (authPrincipal == null);

        if (!isGuestFlow) {
            try {
                currentUser = userService.getUserByUsernameOrEmail(authPrincipal.getName());
            } catch (Exception ignored) {
                currentUser = null; // treat as unauthenticated if lookup fails
                isGuestFlow = true;
            }
        }

        try {
            if (!isGuestFlow && currentUser != null) {
                if (!userService.isProfileComplete(currentUser)) {
                    return ResponseEntity.status(422).body(Map.of(
                        "message", "Please update your information before submitting the quote.",
                        "code", "PROFILE_INCOMPLETE"
                    ));
                }
            } else {
                // Guest submission flow
                com.example.seatrans.features.auth.model.User existing = null;
                try {
                    existing = userService.getUserByUsernameOrEmail(request.getEmail());
                } catch (Exception ignored) {
                    existing = null;
                }

                if (existing != null) {
                    boolean isGuest = existing.hasRole("ROLE_GUEST");

                    if (!isGuest) {
                        // If the email belongs to a registered user but no auth header was sent,
                        // reuse that account instead of failing with 409.
                        // Optional: enforce profile completeness here if needed.
                        currentUser = existing;
                        isGuestFlow = false;
                    } else {
                        // Reuse/refresh guest profile
                        currentUser = userService.createOrReuseGuest(
                            request.getFullName(),
                            request.getEmail(),
                            request.getPhone(),
                            request.getCompany());
                    }
                } else {
                    currentUser = userService.createOrReuseGuest(
                        request.getFullName(),
                        request.getEmail(),
                        request.getPhone(),
                        request.getCompany());
                }
            }
        } catch (DuplicateUserException ex) {
            return ResponseEntity.status(409).body(Map.of(
                "message", "Email already registered. Please log in or use another email."));
        }

        // Use authenticated profile data if available to ensure consistent identity
        String fullName = currentUser != null ? currentUser.getFullName() : request.getFullName();
        String email = currentUser != null ? currentUser.getEmail() : request.getEmail();
        String phone = currentUser != null ? currentUser.getPhone() : request.getPhone();
        String company = currentUser != null ? currentUser.getCompany() : request.getCompany();

        // Prefer serviceTypeSlug from request, fallback to serviceType.getName()
        String serviceSlug = request.getServiceTypeSlug() != null ? request.getServiceTypeSlug() : serviceType.getName();
        String normalizedSlug = serviceSlug != null ? serviceSlug.trim().toLowerCase() : "";

        Long targetId;

        switch (normalizedSlug) {
            case "shipping-agency" -> {
                Long userId = currentUser != null ? currentUser.getId() : null;
                ShippingAgencyInquiry inquiry = buildShippingAgency(fullName, email, phone, company, userId, request);
                targetId = shippingAgencyInquiryRepository.save(inquiry).getId();
            }
            case "chartering-ship-broking" -> {
                Long userId = currentUser != null ? currentUser.getId() : null;
                CharteringBrokingInquiry inquiry = buildChartering(fullName, email, phone, company, userId, request);
                targetId = charteringBrokingInquiryRepository.save(inquiry).getId();
            }
            case "freight-forwarding" -> {
                Long userId = currentUser != null ? currentUser.getId() : null;
                FreightForwardingInquiry inquiry = buildFreight(fullName, email, phone, company, userId, request);
                targetId = freightForwardingInquiryRepository.save(inquiry).getId();
            }
            case "total-logistics" -> {
                Long userId = currentUser != null ? currentUser.getId() : null;
                TotalLogisticInquiry inquiry = buildLogistics(fullName, email, phone, company, userId, request);
                targetId = totalLogisticInquiryRepository.save(inquiry).getId();
            }
            case "special-request" -> {
                Long userId = currentUser != null ? currentUser.getId() : null;
                SpecialRequestInquiry inquiry = buildSpecialRequest(fullName, email, phone, company, userId, request);
                targetId = specialRequestInquiryRepository.save(inquiry).getId();
            }
            default -> {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Unsupported service type: " + normalizedSlug
                ));
            }
        }

        if (files != null && files.length > 0) {
            try {
                String uploaderUsername = currentUser != null ? currentUser.getUsername() : email;
                saveAttachments(serviceSlug, targetId, files, uploaderUsername);
            } catch (IOException | IllegalArgumentException e) {
                // Log error but don't fail the inquiry submission
                System.err.println("Failed to save attachments: " + e.getMessage());
            }
        }

        String successMessage = isGuestFlow
            ? "Please register an account to view the quote process."
            : "Inquiry submitted successfully.";

        return ResponseEntity.ok(Map.of(
            "message", successMessage,
            "guest", isGuestFlow,
            "serviceSlug", serviceType.getName(),
            "targetId", targetId
        ));
    }

    private void saveAttachments(String serviceSlug, Long targetId, MultipartFile[] files, String uploaderUsername) throws IOException {
        if (files == null || files.length == 0) {
            return;
        }

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            documentService.uploadDocument(serviceSlug, targetId, DocumentType.OTHER, file, "User attachment", uploaderUsername);
        }
    }

    private ShippingAgencyInquiry buildShippingAgency(String fullName, String email, String phone, String company,
                                                      Long userId, PublicInquiryRequest request) {
        String detailsJson = null;
        try {
            if (request.getDetails() != null) {
                detailsJson = objectMapper.writeValueAsString(request.getDetails());
            }
        } catch (Exception ignored) {
        }

        return ShippingAgencyInquiry.builder()
            .fullName(fullName)
            .contactInfo(email)
            .phone(phone)
            .company(company)
            .userId(userId)
            .status(InquiryStatus.PROCESSING)
            .notes(request.getNotes())
            .toName(request.getShipownerTo())
            .mv(request.getVesselName())
            .eta(request.getEta())
            .dwt(request.getDwt())
            .grt(request.getGrt())
            .loa(request.getLoa())
            .cargoType(request.getCargoType())
            .cargoName(request.getCargoName())
            .cargoNameOther(request.getCargoNameOther())
            .cargoQuantity(request.getQuantityTons())
            .portOfCall(resolvePortName(request.getPortOfCall()))
            .dischargeLoadingLocation(request.getDischargeLoadingLocation())
            .transportLs(request.getTransportLs())
            .transportQuarantine(request.getTransportQuarantine())
            .frtTaxType(request.getFrtTaxType())
            .boatHireAmount(request.getBoatHireAmount())
            .tallyFeeAmount(request.getTallyFeeAmount())
            .otherInfo(null)
            .submittedAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    }

    private Boolean toBooleanSafe(Object value) {
        if (value == null) return null;
        if (value instanceof Boolean b) return b;
        String str = value.toString().trim().toLowerCase();
        if (str.isEmpty()) return null;
        return str.equals("yes") || str.equals("true");
    }

    private CharteringBrokingInquiry buildChartering(String fullName, String email, String phone, String company,
                                                     Long userId, PublicInquiryRequest request) {
        return CharteringBrokingInquiry.builder()
            .fullName(fullName)
            .contactInfo(email)
            .phone(phone)
            .company(company)
            .userId(userId)
            .status(InquiryStatus.PROCESSING)
            .notes(request.getNotes())
            .cargoQuantity(request.getCargoQuantity())
            .loadingPort(resolvePortName(request.getLoadingPort()))
            .dischargingPort(resolvePortName(request.getDischargingPort()))
            .laycanFrom(request.getLaycanFrom())
            .laycanTo(request.getLaycanTo())
            .otherInfo(null)
            .submittedAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    }

    private FreightForwardingInquiry buildFreight(String fullName, String email, String phone, String company,
                                                  Long userId, PublicInquiryRequest request) {
        return FreightForwardingInquiry.builder()
            .fullName(fullName)
            .contactInfo(email)
            .phone(phone)
            .company(company)
            .userId(userId)
            .status(InquiryStatus.PROCESSING)
            .notes(request.getNotes())
            .cargoName(request.getCargoName())
            .deliveryTerm(request.getDeliveryTerm())
            .container20ft(request.getContainer20())
            .container40ft(request.getContainer40())
            .loadingPort(resolvePortName(request.getLoadingPort()))
            .dischargingPort(resolvePortName(request.getDischargingPort()))
            .shipmentFrom(request.getShipmentFrom())
            .shipmentTo(request.getShipmentTo())
            .submittedAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    }

    private TotalLogisticInquiry buildLogistics(String fullName, String email, String phone, String company,
                                                Long userId, PublicInquiryRequest request) {
        return TotalLogisticInquiry.builder()
            .fullName(fullName)
            .contactInfo(email)
            .phone(phone)
            .company(company)
            .userId(userId)
            .status(InquiryStatus.PROCESSING)
            .notes(request.getNotes())
            .cargoName(request.getCargoName())
            .deliveryTerm(request.getDeliveryTerm())
            .container20ft(request.getContainer20())
            .container40ft(request.getContainer40())
            .loadingPort(resolvePortName(request.getLoadingPort()))
            .dischargingPort(resolvePortName(request.getDischargingPort()))
            .shipmentFrom(request.getShipmentFrom())
            .shipmentTo(request.getShipmentTo())
            .submittedAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    }
    
    private SpecialRequestInquiry buildSpecialRequest(String fullName, String email, String phone, String company,
                                                      Long userId, PublicInquiryRequest request) {
        return SpecialRequestInquiry.builder()
            .fullName(fullName)
            .contactInfo(email)
            .phone(phone)
            .company(company)
            .userId(userId)
            .status(InquiryStatus.PROCESSING)
            .notes(request.getNotes())
            .subject(request.getSubject())
            .preferredProvinceId(request.getPreferredProvinceId())
            .preferredProvinceName(resolveProvinceName(request.getPreferredProvinceId()))
            .relatedDepartmentId(request.getRelatedDepartmentId())
            .relatedDepartmentName(resolveServiceTypeName(request.getRelatedDepartmentId()))
            .message(request.getMessage())
            .submittedAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    }

    private String resolvePortName(String portIdentifier) {
        if (portIdentifier == null) return null;
        try {
            Long id = Long.parseLong(portIdentifier);
            return portRepository.findById(id)
                .map(port -> port.getName())
                .orElse(portIdentifier);
        } catch (NumberFormatException ex) {
            return portIdentifier;
        }
    }

    private Long toLong(Object raw) {
        if (raw == null) return null;
        try {
            return Long.valueOf(raw.toString());
        } catch (Exception ex) {
            return null;
        }
    }

    private BigDecimal toBigDecimal(Object raw) {
        try {
            return raw == null ? null : new BigDecimal(raw.toString());
        } catch (Exception ex) {
            return null;
        }
    }

    private Integer toInteger(Object raw) {
        try {
            return raw == null ? null : Integer.valueOf(raw.toString());
        } catch (Exception ex) {
            return null;
        }
    }

    private LocalDate toLocalDate(Object raw) {
        try {
            return raw == null ? null : LocalDate.parse(raw.toString());
        } catch (Exception ex) {
            return null;
        }
    }

    private String toStringValue(Object raw) {
        return raw == null ? null : raw.toString();
    }    
    private String resolveProvinceName(Long provinceId) {
        if (provinceId == null) return null;
        return provinceRepository.findById(provinceId)
            .map(province -> province.getName())
            .orElse(null);
    }
    
    private String resolveServiceTypeName(Long serviceTypeId) {
        if (serviceTypeId == null) return null;
        return serviceTypeRepository.findById(serviceTypeId)
            .map(serviceType -> serviceType.getName())
            .orElse(null);
    }
    @GetMapping("/{serviceSlug}/{id}")
    public ResponseEntity<?> getOne(@PathVariable String serviceSlug, @PathVariable Long id) {
        return fetchOne(serviceSlug, id);
    }

    private ResponseEntity<?> fetchPage(String serviceSlug, Pageable pageable) {
        String normalized = serviceSlug == null ? "" : serviceSlug.trim().toLowerCase();
        return switch (normalized) {
            case "shipping-agency" -> ResponseEntity.ok(shippingAgencyInquiryRepository.findAll(pageable));
            case "chartering-ship-broking" -> ResponseEntity.ok(charteringBrokingInquiryRepository.findAll(pageable));
            case "freight-forwarding" -> ResponseEntity.ok(freightForwardingInquiryRepository.findAll(pageable));
            case "total-logistics" -> ResponseEntity.ok(totalLogisticInquiryRepository.findAll(pageable));
            case "special-request" -> ResponseEntity.ok(specialRequestInquiryRepository.findAll(pageable));
            default -> ResponseEntity.badRequest().body(Map.of("message", "Unsupported service slug: " + serviceSlug));
        };
    }

    private ResponseEntity<?> fetchOne(String serviceSlug, Long id) {
        String normalized = serviceSlug == null ? "" : serviceSlug.trim().toLowerCase();
        return switch (normalized) {
            case "shipping-agency" -> shippingAgencyInquiryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
            case "chartering-ship-broking" -> charteringBrokingInquiryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
            case "freight-forwarding" -> freightForwardingInquiryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
            case "total-logistics" -> totalLogisticInquiryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
            case "special-request" -> specialRequestInquiryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
            default -> ResponseEntity.badRequest().body(Map.of("message", "Unsupported service slug: " + serviceSlug));
        };
    }
}

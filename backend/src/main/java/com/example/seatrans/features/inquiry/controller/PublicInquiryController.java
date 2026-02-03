package com.example.seatrans.features.inquiry.controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import com.example.seatrans.features.inquiry.dto.InquiryDocumentDTO;
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
import com.example.seatrans.features.logistics.model.ServiceTypeEntity;
import com.example.seatrans.features.logistics.repository.ServiceTypeRepository;
import com.example.seatrans.features.ports.repository.PortRepository;
import com.example.seatrans.features.provinces.repository.ProvinceRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/inquiries")
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

    private static final String SHIPPING_AGENCY = "SHIPPING AGENCY";
    private static final String CHARTERING = "CHARTERING";
    private static final String FREIGHT_FORWARDING = "FREIGHT FORWARDING";
    private static final String LOGISTICS = "LOGISTICS";
    private static final String SPECIAL_REQUEST = "SPECIAL REQUEST";

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
     * SECURITY: Validates that the authenticated user matches the userId in path
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getInquiriesByUser(
            @PathVariable Long userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "serviceType", required = false) String serviceType,
            HttpServletRequest request) {

        // SECURITY CHECK: Verify authenticated user matches the requested userId
        Long currentUserId = (Long) request.getAttribute("userId");
        if (currentUserId == null || !currentUserId.equals(userId)) {
            log.warn("Unauthorized access attempt: user {} tried to access inquiries of user {}", 
                    currentUserId, userId);
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden", 
                    "message", "You can only view your own inquiries"));
        }

        Pageable pageable = Pageable.unpaged();

        // Filter by serviceType if provided (exact name as stored in DB)
        boolean filterService = serviceType != null && !serviceType.isBlank();
        String requestedServiceName = filterService ? serviceType.trim() : null;

        Map<String, ServiceTypeEntity> serviceTypes = serviceTypeRepository.findAll().stream()
            .collect(Collectors.toMap(ServiceTypeEntity::getName, st -> st, (a, b) -> a));

        if (filterService && !serviceTypes.containsKey(requestedServiceName)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Unsupported service type: " + requestedServiceName));
        }

        ServiceTypeEntity shippingType = serviceTypes.get(SHIPPING_AGENCY);
        ServiceTypeEntity charteringType = serviceTypes.get(CHARTERING);
        ServiceTypeEntity freightType = serviceTypes.get(FREIGHT_FORWARDING);
        ServiceTypeEntity logisticsType = serviceTypes.get(LOGISTICS);
        ServiceTypeEntity specialType = serviceTypes.get(SPECIAL_REQUEST);

        if (shippingType == null || charteringType == null || freightType == null || logisticsType == null || specialType == null) {
            log.error("Service type configuration is missing in database");
            return ResponseEntity.status(500).body(Map.of("message", "Service type configuration is missing"));
        }

        // Aggregate inquiries based on serviceType filter
        var shippingAgency = includeService(requestedServiceName, SHIPPING_AGENCY)
            ? shippingAgencyInquiryRepository.findByUserId(userId, pageable).getContent()
            : List.<ShippingAgencyInquiry>of();
        var chartering = includeService(requestedServiceName, CHARTERING)
            ? charteringBrokingInquiryRepository.findByUserId(userId, pageable).getContent()
            : List.<CharteringBrokingInquiry>of();
        var freight = includeService(requestedServiceName, FREIGHT_FORWARDING)
            ? freightForwardingInquiryRepository.findByUserId(userId, pageable).getContent()
            : List.<FreightForwardingInquiry>of();
        var logistics = includeService(requestedServiceName, LOGISTICS)
            ? totalLogisticInquiryRepository.findByUserId(userId, pageable).getContent()
            : List.<TotalLogisticInquiry>of();
        var special = includeService(requestedServiceName, SPECIAL_REQUEST)
            ? specialRequestInquiryRepository.findByUserId(userId, pageable).getContent()
            : List.<SpecialRequestInquiry>of();

        List<Map<String, Object>> all = new ArrayList<>();
        
        // Helper to enrich with user info
        java.util.function.BiConsumer<Map<String, Object>, Long> enrichUserInfo = (item, uid) -> {
            try {
                var user = userService.getUserById(uid);
                if (user != null) {
                    item.put("email", user.getEmail());
                    item.put("phone", user.getPhone());
                    item.put("company", user.getCompany());
                    // Also update fullName from user if not present
                    if (!item.containsKey("fullName") || item.get("fullName") == null) {
                        item.put("fullName", user.getFullName());
                    }
                }
            } catch (Exception e) {
                log.warn("Could not enrich user info for userId {}: {}", uid, e.getMessage());
            }
        };
        
        shippingAgency.forEach(i -> {
            ShippingAgencyInquiryResponse dto = ShippingAgencyInquiryResponse.from(i);
            Map<String, Object> item = objectMapper.convertValue(dto, Map.class);
            item.put("serviceType", Map.of(
                "id", shippingType.getId(),
                "name", shippingType.getName(),
                "displayName", shippingType.getDisplayName()
            ));
            enrichUserInfo.accept(item, i.getUserId());
            all.add(item);
        });
        chartering.forEach(i -> {
            CharteringBrokingInquiryResponse dto = CharteringBrokingInquiryResponse.from(i);
            Map<String, Object> item = objectMapper.convertValue(dto, Map.class);
            item.put("serviceType", Map.of(
                "id", charteringType.getId(),
                "name", charteringType.getName(),
                "displayName", charteringType.getDisplayName()
            ));
            enrichUserInfo.accept(item, i.getUserId());
            all.add(item);
        });
        freight.forEach(i -> {
            FreightForwardingInquiryResponse dto = FreightForwardingInquiryResponse.from(i);
            Map<String, Object> item = objectMapper.convertValue(dto, Map.class);
            item.put("serviceType", Map.of(
                "id", freightType.getId(),
                "name", freightType.getName(),
                "displayName", freightType.getDisplayName()
            ));
            enrichUserInfo.accept(item, i.getUserId());
            all.add(item);
        });
        logistics.forEach(i -> {
            TotalLogisticInquiryResponse dto = TotalLogisticInquiryResponse.from(i);
            Map<String, Object> item = objectMapper.convertValue(dto, Map.class);
            item.put("serviceType", Map.of(
                "id", logisticsType.getId(),
                "name", logisticsType.getName(),
                "displayName", logisticsType.getDisplayName()
            ));
            enrichUserInfo.accept(item, i.getUserId());
            all.add(item);
        });
        special.forEach(i -> {
            SpecialRequestInquiryResponse dto = SpecialRequestInquiryResponse.from(i);
            Map<String, Object> item = objectMapper.convertValue(dto, Map.class);
            item.put("serviceType", Map.of(
                "id", specialType.getId(),
                "name", specialType.getName(),
                "displayName", specialType.getDisplayName()
            ));
            enrichUserInfo.accept(item, i.getUserId());
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
            java.security.Principal principal) {
        return handleSubmit(request, files, principal, null);
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> submitPublicInquiryJson(
            @RequestBody @Validated PublicInquiryRequest request,
            java.security.Principal principal) {
        return handleSubmit(request, null, principal, null);
    }

    private ResponseEntity<?> handleSubmit(
            PublicInquiryRequest request,
            MultipartFile[] files,
            java.security.Principal principal,
            String serviceSlugOverride) {

        // Require authentication
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of(
                "message", "Please log in to submit an inquiry.",
                "code", "AUTHENTICATION_REQUIRED"
            ));
        }

        // Resolve service type by ID or name/slug
        if (serviceSlugOverride != null) {
            request.setServiceTypeSlug(serviceSlugOverride);
        }

        ServiceTypeEntity serviceType;
        try {
            serviceType = request.getServiceTypeId() != null
                ? serviceTypeRepository.findById(request.getServiceTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid service type ID"))
                : resolveServiceTypeBySlug(request.getServiceTypeSlug());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }

        // Get authenticated user
        com.example.seatrans.features.auth.model.User currentUser;
        try {
            currentUser = userService.getUserByEmail(principal.getName());
        } catch (Exception ex) {
            return ResponseEntity.status(401).body(Map.of(
                "message", "User not found. Please log in again.",
                "code", "USER_NOT_FOUND"
            ));
        }

        // Check if profile is complete
        if (!userService.isProfileComplete(currentUser)) {
            return ResponseEntity.status(422).body(Map.of(
                "message", "Please complete your profile before submitting an inquiry.",
                "code", "PROFILE_INCOMPLETE"
            ));
        }

        String serviceName = serviceType.getName();

        Long targetId;

        switch (serviceName) {
            case SHIPPING_AGENCY -> {
                ShippingAgencyInquiry inquiry = buildShippingAgency(currentUser.getId(), request);
                targetId = shippingAgencyInquiryRepository.save(inquiry).getId();
            }
            case CHARTERING -> {
                CharteringBrokingInquiry inquiry = buildChartering(currentUser.getId(), request);
                targetId = charteringBrokingInquiryRepository.save(inquiry).getId();
            }
            case FREIGHT_FORWARDING -> {
                FreightForwardingInquiry inquiry = buildFreight(currentUser.getId(), request);
                targetId = freightForwardingInquiryRepository.save(inquiry).getId();
            }
            case LOGISTICS -> {
                TotalLogisticInquiry inquiry = buildLogistics(currentUser.getId(), request);
                targetId = totalLogisticInquiryRepository.save(inquiry).getId();
            }
            case SPECIAL_REQUEST -> {
                SpecialRequestInquiry inquiry = buildSpecialRequest(currentUser.getId(), request);
                targetId = specialRequestInquiryRepository.save(inquiry).getId();
            }
            default -> {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Unsupported service type: " + serviceName
                ));
            }
        }

        if (files != null && files.length > 0) {
            try {
                Long uploaderId = currentUser.getId();
                log.info("Saving {} attachments for serviceName={}, targetId={}, uploaderId={}", 
                    files.length, serviceName, targetId, uploaderId);
                saveAttachments(serviceName, targetId, files, uploaderId);
                log.info("Successfully saved {} attachments", files.length);
            } catch (IOException | IllegalArgumentException e) {
                // Log error but don't fail the inquiry submission
                log.error("Failed to save attachments for serviceName={}, targetId={}: {}", 
                    serviceName, targetId, e.getMessage(), e);
            }
        }

        return ResponseEntity.ok(Map.of(
            "message", "Inquiry submitted successfully.",
            "serviceSlug", serviceName,
            "targetId", targetId
        ));
    }

    /**
     * Resolve service type by slug-style input (e.g., "special-request") by
     * attempting exact name match, then title-cased name with spaces.
     */
    private ServiceTypeEntity resolveServiceTypeBySlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new IllegalArgumentException("Service type name is required");
        }

        return serviceTypeRepository.findByName(slug.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid service type: " + slug));
    }

    private void saveAttachments(String serviceSlug, Long targetId, MultipartFile[] files, Long uploaderId) throws IOException {
        if (files == null || files.length == 0) {
            return;
        }

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                log.warn("Skipping empty file");
                continue;
            }

            log.info("Uploading file: name={}, size={}, type={}", 
                    file.getOriginalFilename(), file.getSize(), file.getContentType());
            
            try {
                InquiryDocumentDTO doc = documentService.uploadDocument(
                    serviceSlug, targetId, DocumentType.OTHER, file, "User attachment", uploaderId);
                log.info("Successfully uploaded document: id={}", doc.getId());
            } catch (Exception e) {
                log.error("Failed to upload file {}: {}", file.getOriginalFilename(), e.getMessage(), e);
                throw e;
            }
        }
    }

    private ShippingAgencyInquiry buildShippingAgency(Long userId, PublicInquiryRequest request) {
        String detailsJson = null;
        try {
            if (request.getDetails() != null) {
                detailsJson = objectMapper.writeValueAsString(request.getDetails());
            }
        } catch (Exception ignored) {
        }

        return ShippingAgencyInquiry.builder()
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

    private CharteringBrokingInquiry buildChartering(Long userId, PublicInquiryRequest request) {
        return CharteringBrokingInquiry.builder()
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

    private FreightForwardingInquiry buildFreight(Long userId, PublicInquiryRequest request) {
        return FreightForwardingInquiry.builder()
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

    private TotalLogisticInquiry buildLogistics(Long userId, PublicInquiryRequest request) {
        return TotalLogisticInquiry.builder()
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
    
    private SpecialRequestInquiry buildSpecialRequest(Long userId, PublicInquiryRequest request) {
        return SpecialRequestInquiry.builder()
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

    private boolean includeService(String requestedServiceName, String targetName) {
        return requestedServiceName == null || targetName.equals(requestedServiceName);
    }
    @GetMapping("/{serviceSlug}/{id}")
    public ResponseEntity<?> getOne(@PathVariable String serviceSlug, @PathVariable Long id) {
        return fetchOne(serviceSlug, id);
    }

    private ResponseEntity<?> fetchPage(String serviceSlug, Pageable pageable) {
        ServiceTypeEntity serviceType;
        try {
            serviceType = resolveServiceTypeBySlug(serviceSlug);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
        return switch (serviceType.getName()) {
            case SHIPPING_AGENCY -> ResponseEntity.ok(shippingAgencyInquiryRepository.findAll(pageable));
            case CHARTERING -> ResponseEntity.ok(charteringBrokingInquiryRepository.findAll(pageable));
            case FREIGHT_FORWARDING -> ResponseEntity.ok(freightForwardingInquiryRepository.findAll(pageable));
            case LOGISTICS -> ResponseEntity.ok(totalLogisticInquiryRepository.findAll(pageable));
            case SPECIAL_REQUEST -> ResponseEntity.ok(specialRequestInquiryRepository.findAll(pageable));
            default -> ResponseEntity.badRequest().body(Map.of("message", "Unsupported service type: " + serviceType.getName()));
        };
    }

    /**
     * DELETE /api/v1/inquiries/batch
     * Delete multiple inquiries for authenticated user only
     * SECURITY: Verifies ownership before deletion
     */
    @DeleteMapping("/batch")
    public ResponseEntity<?> deleteUserInquiries(
            @RequestBody BatchDeleteRequest request,
            HttpServletRequest servletRequest) {
        if (request == null || request.ids() == null || request.ids().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "ids are required"));
        }

        // SECURITY CHECK: Get current authenticated user
        Long userId = (Long) servletRequest.getAttribute("userId");
        if (userId == null) {
            log.warn("Unauthorized batch delete attempt: no authenticated user");
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden", 
                    "message", "You must be authenticated to delete inquiries"));
        }
        int deletedCount = 0;
        int forbiddenCount = 0;

        for (Long id : request.ids()) {
            // Verify ownership before deletion
            boolean owned = checkOwnership(id, userId);
            if (owned) {
                if (deleteByAnyService(id)) {
                    deletedCount++;
                } else {
                    log.warn("User {} tried to delete non-existent inquiry {}", userId, id);
                }
            } else {
                forbiddenCount++;
                log.warn("User {} tried to delete inquiry {} they don't own", userId, id);
            }
        }

        return ResponseEntity.ok(Map.of(
            "deleted", deletedCount,
            "forbidden", forbiddenCount,
            "requested", request.ids().size()
        ));
    }

    /**
     * Check if inquiry belongs to user
     */
    private boolean checkOwnership(Long inquiryId, Long userId) {
        return shippingAgencyInquiryRepository.findById(inquiryId).map(i -> i.getUserId().equals(userId)).orElse(false)
            || charteringBrokingInquiryRepository.findById(inquiryId).map(i -> i.getUserId().equals(userId)).orElse(false)
            || freightForwardingInquiryRepository.findById(inquiryId).map(i -> i.getUserId().equals(userId)).orElse(false)
            || totalLogisticInquiryRepository.findById(inquiryId).map(i -> i.getUserId().equals(userId)).orElse(false)
            || specialRequestInquiryRepository.findById(inquiryId).map(i -> i.getUserId().equals(userId)).orElse(false);
    }

    /**
     * Delete inquiry from any service by ID
     */
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
     * DTO for batch delete request
     */
    public record BatchDeleteRequest(List<Long> ids) {}

    private ResponseEntity<?> fetchOne(String serviceSlug, Long id) {
        ServiceTypeEntity serviceType;
        try {
            serviceType = resolveServiceTypeBySlug(serviceSlug);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
        return switch (serviceType.getName()) {
            case SHIPPING_AGENCY -> shippingAgencyInquiryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
            case CHARTERING -> charteringBrokingInquiryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
            case FREIGHT_FORWARDING -> freightForwardingInquiryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
            case LOGISTICS -> totalLogisticInquiryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
            case SPECIAL_REQUEST -> specialRequestInquiryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
            default -> ResponseEntity.badRequest().body(Map.of("message", "Unsupported service type: " + serviceType.getName()));
        };
    }
}

package com.example.seatrans.features.inquiry.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import org.springframework.data.domain.Page;
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
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.auth.service.UserService;
import com.example.seatrans.features.inquiry.dto.PublicInquiryRequest;
import com.example.seatrans.features.inquiry.model.CharteringBrokingInquiry;
import com.example.seatrans.features.inquiry.model.FreightForwardingInquiry;
import com.example.seatrans.features.inquiry.model.InquiryStatus;
import com.example.seatrans.features.inquiry.model.ServiceInquiry;
import com.example.seatrans.features.inquiry.model.ShippingAgencyInquiry;
import com.example.seatrans.features.inquiry.repository.InquiryRepository;
import com.example.seatrans.features.logistics.repository.PortRepository;
import com.example.seatrans.features.logistics.repository.ServiceTypeRepository;
import com.example.seatrans.shared.exception.DuplicateUserException;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/inquiries")
@Validated
public class PublicInquiryController {

    private final InquiryRepository inquiryRepository;
    private final UserService userService;
    private final ServiceTypeRepository serviceTypeRepository;
    private final PortRepository portRepository;
    private final ObjectMapper objectMapper;

    public PublicInquiryController(
            InquiryRepository inquiryRepository,
            UserService userService,
            ServiceTypeRepository serviceTypeRepository,
            PortRepository portRepository,
            ObjectMapper objectMapper) {
        this.inquiryRepository = inquiryRepository;
        this.userService = userService;
        this.serviceTypeRepository = serviceTypeRepository;
        this.portRepository = portRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<?> listPublic() {
        // In production, restrict fields or apply projection; for now return all
        return ResponseEntity.ok(inquiryRepository.findTop10ByOrderBySubmittedAtDesc());
    }

    @PostMapping
    public ResponseEntity<?> submitPublicInquiry(@RequestBody @Validated PublicInquiryRequest request,
                                                 @AuthenticationPrincipal java.security.Principal principal) {
        var serviceType = serviceTypeRepository.findById(request.getServiceTypeId())
            .orElseThrow(() -> new IllegalArgumentException("Invalid service type"));

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

        ServiceInquiry inquiry = ServiceInquiry.builder()
            .serviceType(serviceType)
            .fullName(fullName)
            .contactInfo(email)
            .phone(phone)
            .company(company)
            .status(InquiryStatus.PENDING)
            .notes(request.getNotes())
            .build();

        try {
            if (request.getDetails() != null) {
                inquiry.setDetails(objectMapper.writeValueAsString(request.getDetails()));
            }
        } catch (Exception ignored) {
            // swallow serialization issue; still persist core fields
        }

        Map<String, Object> details = request.getDetails();
        attachServiceSpecificDetails(inquiry, serviceType.getName(), details);

        inquiryRepository.save(inquiry);

        String successMessage = isGuestFlow
            ? "Please register an account to view the quote process."
            : "Inquiry submitted successfully.";

        return ResponseEntity.ok(Map.of(
            "message", successMessage,
            "guest", isGuestFlow
        ));
    }

    private void attachServiceSpecificDetails(ServiceInquiry inquiry, String serviceSlug, Map<String, Object> details) {
        if (serviceSlug == null) return;
        String normalized = serviceSlug.trim().toLowerCase();
        Map<String, Object> safeDetails = details != null ? details : Map.of();

        switch (normalized) {
            case "shipping-agency" -> attachShippingAgency(inquiry, safeDetails);
            case "chartering-ship-broking" -> attachChartering(inquiry, safeDetails);
            case "freight-forwarding" -> attachFreight(inquiry, safeDetails);
            case "total-logistics" -> attachFreight(inquiry, safeDetails); // same shape as freight
            default -> { /* keep generic */ }
        }
    }

    private void attachShippingAgency(ServiceInquiry inquiry, Map<String, Object> details) {
        ShippingAgencyInquiry detail = ShippingAgencyInquiry.builder()
            .dwt(toBigDecimal(details.get("dwt")))
            .grt(toBigDecimal(details.get("grt")))
            .loa(toBigDecimal(details.get("loa")))
            .cargoQuantity(toStringValue(details.get("cargoQuantity")))
            .portId(toLong(details.get("portOfCall")))
            .portOfCall(resolvePortName(details.get("portOfCall")))
            .portName(toStringValue(details.get("portName")))
            .otherInfo(toStringValue(details.get("otherInfo")))
            .build();
        inquiry.setShippingAgencyDetail(detail);
    }

    private void attachChartering(ServiceInquiry inquiry, Map<String, Object> details) {
        CharteringBrokingInquiry detail = CharteringBrokingInquiry.builder()
            .cargoQuantity(toStringValue(details.get("cargoQuantity")))
            .loadingPort(resolvePortName(details.get("loadingPort")))
            .dischargingPort(resolvePortName(details.get("dischargingPort")))
            .laycanFrom(toLocalDate(details.get("laycanFrom")))
            .laycanTo(toLocalDate(details.get("laycanTo")))
            .otherInfo(toStringValue(details.get("otherInfo")))
            .build();
        inquiry.setCharteringBrokingDetail(detail);
    }

    private void attachFreight(ServiceInquiry inquiry, Map<String, Object> details) {
        FreightForwardingInquiry detail = FreightForwardingInquiry.builder()
            .cargoName(toStringValue(details.get("cargoName")))
            .deliveryTerm(toStringValue(details.get("deliveryTerm")))
            .container20ft(toInteger(details.get("container20")))
            .container40ft(toInteger(details.get("container40")))
            .loadingPort(resolvePortName(details.get("loadingPort")))
            .dischargingPort(resolvePortName(details.get("dischargingPort")))
            .shipmentFrom(toLocalDate(details.get("shipmentFrom")))
            .shipmentTo(toLocalDate(details.get("shipmentTo")))
            .build();
        inquiry.setFreightForwardingDetail(detail);
    }

    private String resolvePortName(Object raw) {
        if (raw == null) return null;
        String value = raw.toString();
        try {
            Long id = Long.parseLong(value);
            return portRepository.findById(id)
                .map(port -> port.getName())
                .orElse(value);
        } catch (NumberFormatException ex) {
            return value;
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

    private Long toLong(Object raw) {
        try {
            return raw == null ? null : Long.valueOf(raw.toString());
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

    @GetMapping("/me")
    public ResponseEntity<Page<ServiceInquiry>> listForCurrentUser(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        // Get authentication from SecurityContext (set by JWT filter)
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        String username = auth.getPrincipal().toString();
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        String identifier = username;
        try {
            var user = userService.getUserByUsernameOrEmail(username);
            if (user.getEmail() != null) {
                identifier = user.getEmail();
            }
        } catch (Exception ignored) {
            // fallback to username
        }

        Page<ServiceInquiry> result = inquiryRepository.findByContactInfoContainingIgnoreCase(identifier, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceInquiry> getOne(@PathVariable Long id) {
        return inquiryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

package com.example.seatrans.features.inquiry.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.inquiry.dto.PublicInquiryRequest;
import com.example.seatrans.features.inquiry.model.InquiryStatus;
import com.example.seatrans.features.inquiry.model.ServiceInquiry;
import com.example.seatrans.features.inquiry.repository.InquiryRepository;
import com.example.seatrans.features.inquiry.repository.ServiceFormFieldRepository;
import com.example.seatrans.features.logistics.repository.ServiceTypeRepository;
import com.example.seatrans.features.user.service.UserService;
import com.example.seatrans.shared.exception.DuplicateUserException;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/inquiries")
@Validated
public class PublicInquiryController {

    private final InquiryRepository inquiryRepository;
    private final UserService userService;
    private final ServiceTypeRepository serviceTypeRepository;
    private final ServiceFormFieldRepository formFieldRepository;
    private final ObjectMapper objectMapper;

    public PublicInquiryController(
            InquiryRepository inquiryRepository,
            UserService userService,
            ServiceTypeRepository serviceTypeRepository,
            ServiceFormFieldRepository formFieldRepository,
            ObjectMapper objectMapper) {
        this.inquiryRepository = inquiryRepository;
        this.userService = userService;
        this.serviceTypeRepository = serviceTypeRepository;
        this.formFieldRepository = formFieldRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<?> listPublic() {
        // In production, restrict fields or apply projection; for now return all
        return ResponseEntity.ok(inquiryRepository.findTop10ByOrderBySubmittedAtDesc());
    }

    @PostMapping
    public ResponseEntity<?> submitPublicInquiry(@RequestBody @Validated PublicInquiryRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        var serviceType = serviceTypeRepository.findById(request.getServiceTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid service type"));

        // Validate dynamic required fields
        List<String> missing = formFieldRepository
                .findByServiceTypeIdAndIsActiveTrueOrderByPositionAsc(serviceType.getId())
                .stream()
                .filter(f -> Boolean.TRUE.equals(f.getRequired()))
                .map(f -> f.getKey())
                .filter(key -> request.getDetails() == null || !request.getDetails().containsKey(key)
                        || request.getDetails().get(key) == null
                        || (request.getDetails().get(key) instanceof String s && s.trim().isEmpty()))
                .collect(Collectors.toList());
        if (!missing.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Missing required fields: " + String.join(", ", missing)));
        }

        UserDetails authPrincipal = principal;
        com.example.seatrans.features.user.model.User currentUser = null;
        if (authPrincipal != null) {
            try {
                currentUser = userService.getUserByUsernameOrEmail(authPrincipal.getUsername());
            } catch (Exception ignored) {
                // if lookup fails, treat as unauthenticated
                currentUser = null;
            }
        }

        try {
            if (currentUser != null) {
                if (!userService.isProfileComplete(currentUser)) {
                    return ResponseEntity.status(422).body(Map.of(
                            "message", "Please update your information before submitting the quote.",
                            "code", "PROFILE_INCOMPLETE"));
                }
            } else {
                userService.createOrReuseGuest(
                        request.getFullName(),
                        request.getEmail(),
                        request.getPhone(),
                        request.getNation());
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

        inquiryRepository.save(inquiry);

        return ResponseEntity.ok(Map.of(
                "message",
                "Inquiry submitted successfully. For faster response, consider creating an account."));
    }

    @GetMapping("/me")
    public ResponseEntity<Page<ServiceInquiry>> listForCurrentUser(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        String identifier = principal.getUsername();
        try {
            var user = userService.getUserByUsernameOrEmail(principal.getUsername());
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

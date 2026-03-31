package com.example.seatrans.features.booking.controller;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.seatrans.features.booking.dto.BookingPartnerDetailResponse;
import com.example.seatrans.features.booking.dto.BookingPartnerPageResponse;
import com.example.seatrans.features.booking.dto.BookingPartnerUpsertRequest;
import com.example.seatrans.features.booking.dto.PartnerImportCommitResponse;
import com.example.seatrans.features.booking.dto.PartnerImportPreviewResponse;
import com.example.seatrans.features.booking.dto.UpdateCustomerStatusRequest;
import com.example.seatrans.features.booking.model.CustomerStatus;
import com.example.seatrans.features.booking.model.CustomerType;
import com.example.seatrans.features.booking.model.PartnerAdditionType;
import com.example.seatrans.features.booking.service.BookingPartnerImportService;
import com.example.seatrans.features.booking.service.BookingPartnerService;
import com.example.seatrans.shared.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/booking-management/partners")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLOYEE','ROLE_INTERNAL')")
@RequiredArgsConstructor
public class AdminBookingPartnerController {

    private final BookingPartnerService bookingPartnerService;
    private final BookingPartnerImportService bookingPartnerImportService;

    @GetMapping
    public ResponseEntity<ApiResponse<BookingPartnerPageResponse>> listPartners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "updatedAt,desc") String sort,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) CustomerStatus customerStatus,
            @RequestParam(required = false) CustomerType customerType,
            @RequestParam(required = false) List<PartnerAdditionType> additionTypes,
            @RequestParam(defaultValue = "OR") String additionTypesMode,
            @RequestParam(defaultValue = "false") boolean includeArchived
    ) {
        Sort sortObj = parseSort(sort);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), sortObj);

        BookingPartnerPageResponse response = bookingPartnerService.listPartners(
            q,
            customerStatus,
            customerType,
            additionTypes,
            additionTypesMode,
            includeArchived,
            pageable
        );
        return ResponseEntity.ok(ApiResponse.success("Partners retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingPartnerDetailResponse>> getPartner(@PathVariable Long id) {
        try {
            BookingPartnerDetailResponse partner = bookingPartnerService.getDetail(id, true);
            return ResponseEntity.ok(ApiResponse.success("Partner retrieved successfully", partner));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingPartnerDetailResponse>> createPartner(@Valid @RequestBody BookingPartnerUpsertRequest request) {
        try {
            BookingPartnerDetailResponse created = bookingPartnerService.createPartner(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Partner created successfully", created));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingPartnerDetailResponse>> updatePartner(
            @PathVariable Long id,
            @Valid @RequestBody BookingPartnerUpsertRequest request
    ) {
        try {
            BookingPartnerDetailResponse updated = bookingPartnerService.updatePartner(id, request);
            return ResponseEntity.ok(ApiResponse.success("Partner updated successfully", updated));
        } catch (IllegalArgumentException ex) {
            HttpStatus status = "Partner not found".equals(ex.getMessage()) ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @PatchMapping("/{id}/customer-status")
    public ResponseEntity<ApiResponse<BookingPartnerDetailResponse>> updateCustomerStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCustomerStatusRequest request
    ) {
        try {
            BookingPartnerDetailResponse updated = bookingPartnerService.updateCustomerStatus(id, request.getCustomerStatus());
            return ResponseEntity.ok(ApiResponse.success("Customer status updated successfully", updated));
        } catch (IllegalArgumentException ex) {
            HttpStatus status = "Partner not found".equals(ex.getMessage()) ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePartner(@PathVariable Long id) {
        try {
            bookingPartnerService.delete(id);
            return ResponseEntity.ok(ApiResponse.success("Partner deleted successfully", null));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @PostMapping(value = "/import/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PartnerImportPreviewResponse>> previewImport(
            @RequestParam("file") MultipartFile file
    ) {
        try {
            PartnerImportPreviewResponse response = bookingPartnerImportService.preview(file);
            return ResponseEntity.ok(ApiResponse.success("Preview generated successfully", response));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @PostMapping(value = "/import/commit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PartnerImportCommitResponse>> commitImport(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "CREATE_ONLY") String mode
    ) {
        try {
            PartnerImportCommitResponse response = bookingPartnerImportService.commit(file, mode);
            return ResponseEntity.ok(ApiResponse.success("Import completed", response));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage()));
        }
    }

    @GetMapping("/import/template")
    public ResponseEntity<byte[]> downloadImportTemplate() {
        byte[] template = bookingPartnerImportService.generateTemplate();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=partner-import-template.xlsx")
            .contentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ))
            .body(template);
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "updatedAt");
        }

        String[] tokens = sort.split(",");
        String field = tokens[0].trim();
        Sort.Direction direction = Sort.Direction.DESC;
        if (tokens.length > 1) {
            direction = "asc".equalsIgnoreCase(tokens[1].trim()) ? Sort.Direction.ASC : Sort.Direction.DESC;
        }

        return Sort.by(direction, field);
    }
}

package com.example.seatrans.features.inquiry.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.inquiry.model.InquiryStatus;
import com.example.seatrans.features.inquiry.model.ServiceInquiry;
import com.example.seatrans.features.inquiry.repository.InquiryRepository;

@RestController
@RequestMapping("/api/admin/inquiries")
public class AdminInquiryController {

    private final InquiryRepository inquiryRepository;

    public AdminInquiryController(InquiryRepository inquiryRepository) {
        this.inquiryRepository = inquiryRepository;
    }

    @GetMapping
    public ResponseEntity<?> getInquiries(
            @RequestParam(value = "serviceTypeId", required = false) Long serviceTypeId,
            @RequestParam(value = "status", required = false) InquiryStatus status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));

        if (serviceTypeId != null && status != null) {
            Page<ServiceInquiry> result = inquiryRepository.findByServiceTypeIdAndStatus(serviceTypeId, status, pageable);
            return ResponseEntity.ok(result);
        }
        if (serviceTypeId != null) {
            Page<ServiceInquiry> result = inquiryRepository.findByServiceTypeId(serviceTypeId, pageable);
            return ResponseEntity.ok(result);
        }
        if (status != null) {
            Page<ServiceInquiry> result = inquiryRepository.findByStatus(status, pageable);
            return ResponseEntity.ok(result);
        }
        Page<ServiceInquiry> result = inquiryRepository.findAll(pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/recent")
    public List<ServiceInquiry> getRecent() {
        return inquiryRepository.findTop10ByOrderBySubmittedAtDesc();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInquiry(@PathVariable Long id) {
        if (!inquiryRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        inquiryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ServiceInquiry> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request) {
        return inquiryRepository.findById(id)
                .map(inquiry -> {
                    if (request.status() != null) {
                        inquiry.setStatus(request.status());
                    }
                    ServiceInquiry saved = inquiryRepository.save(inquiry);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public record UpdateStatusRequest(InquiryStatus status) {}
}

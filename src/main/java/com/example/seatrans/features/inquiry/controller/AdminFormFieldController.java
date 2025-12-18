package com.example.seatrans.features.inquiry.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.inquiry.dto.FormFieldDTO;
import com.example.seatrans.features.inquiry.dto.FormFieldRequest;
import com.example.seatrans.features.inquiry.service.ServiceFormFieldService;

@RestController
@RequestMapping("/api/admin/service-types/{serviceTypeId}/form-fields")
@Validated
public class AdminFormFieldController {

    private final ServiceFormFieldService serviceFormFieldService;

    public AdminFormFieldController(ServiceFormFieldService serviceFormFieldService) {
        this.serviceFormFieldService = serviceFormFieldService;
    }

    @GetMapping
    public ResponseEntity<List<FormFieldDTO>> list(@PathVariable Long serviceTypeId) {
        return ResponseEntity.ok(serviceFormFieldService.list(serviceTypeId, false));
    }

    @PostMapping
    public ResponseEntity<FormFieldDTO> create(@PathVariable Long serviceTypeId,
                                               @RequestBody @Validated FormFieldRequest request) {
        return ResponseEntity.ok(serviceFormFieldService.create(serviceTypeId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormFieldDTO> update(@PathVariable Long id,
                                               @RequestBody @Validated FormFieldRequest request) {
        return ResponseEntity.ok(serviceFormFieldService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        serviceFormFieldService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

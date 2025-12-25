package com.example.seatrans.features.inquiry.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.inquiry.dto.FormFieldDTO;
import com.example.seatrans.features.inquiry.service.ServiceFormFieldService;

@RestController
@RequestMapping("/api/service-types/{serviceTypeId}/form-fields")
@Validated
public class FormFieldController {

    private final ServiceFormFieldService serviceFormFieldService;

    public FormFieldController(ServiceFormFieldService serviceFormFieldService) {
        this.serviceFormFieldService = serviceFormFieldService;
    }

    @GetMapping
    public ResponseEntity<List<FormFieldDTO>> listPublic(@PathVariable Long serviceTypeId) {
        return ResponseEntity.ok(serviceFormFieldService.list(serviceTypeId, true));
    }
}

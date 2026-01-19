package com.example.seatrans.features.logistics.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.logistics.dto.OfficeDTO;
import com.example.seatrans.features.logistics.service.OfficeService;
import com.example.seatrans.shared.dto.ApiResponse;

@RestController
@RequestMapping("/api/v1/offices")
public class OfficeController {

    @Autowired
    private OfficeService officeService;

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<OfficeDTO>>> getActiveOffices() {
        try {
            List<OfficeDTO> offices = officeService.getAllActiveOffices();
            return ResponseEntity.ok(ApiResponse.success("Active offices retrieved successfully", offices));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving active offices: " + e.getMessage()));
        }
    }
}

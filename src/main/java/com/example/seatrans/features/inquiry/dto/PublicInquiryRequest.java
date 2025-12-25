package com.example.seatrans.features.inquiry.dto;

import java.util.Map;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PublicInquiryRequest {

    @NotNull
    private Long serviceTypeId;

    @NotBlank
    private String fullName;

    @NotBlank
    private String company;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String phone;

    private String notes;

    private Map<String, Object> details;
}

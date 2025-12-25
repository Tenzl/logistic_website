package com.example.seatrans.features.inquiry.dto;

import com.example.seatrans.features.inquiry.model.ServiceFormField.FieldType;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FormFieldRequest(
    @NotBlank String key,
    @NotBlank String label,
    @NotNull FieldType type,
    @NotNull Boolean required,
    String placeholder,
    @NotNull @Min(1) @Max(12) Integer gridSpan,
    String options,
    @NotNull Integer position,
    @NotNull Boolean isActive,
    String meta
) {}

package com.example.seatrans.features.inquiry.dto;

import com.example.seatrans.features.inquiry.model.ServiceFormField.FieldType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FormFieldDTO {
    private Long id;
    private String key;
    private String label;
    private FieldType type;
    private Boolean required;
    private String placeholder;
    private Integer gridSpan;
    private String options; // JSON string when select
    private Integer position;
    private Boolean isActive;
}

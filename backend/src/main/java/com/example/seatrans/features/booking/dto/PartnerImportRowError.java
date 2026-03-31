package com.example.seatrans.features.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerImportRowError {
    private int rowIndex;
    private String field;
    private String message;
    private String code;
}

package com.example.seatrans.features.booking.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerImportCommitResponse {
    private int createdCount;
    private int updatedCount;
    private int failedCount;

    @Builder.Default
    private List<PartnerImportRowError> rowErrors = new ArrayList<>();
}

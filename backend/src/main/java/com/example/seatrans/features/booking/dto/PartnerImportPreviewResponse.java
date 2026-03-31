package com.example.seatrans.features.booking.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerImportPreviewResponse {
    @Builder.Default
    private List<String> headers = new ArrayList<>();

    @Builder.Default
    private List<Map<String, String>> rows = new ArrayList<>();

    @Builder.Default
    private List<PartnerImportRowError> rowErrors = new ArrayList<>();

    private Summary summary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private int total;
        private int valid;
        private int invalid;
    }
}

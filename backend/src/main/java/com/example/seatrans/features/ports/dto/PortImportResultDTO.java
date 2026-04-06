package com.example.seatrans.features.ports.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortImportResultDTO {

    private int imported;
    private int duplicates;
    private int skipped;
    private int failed;

    @Builder.Default
    private List<String> errors = new ArrayList<>();
}

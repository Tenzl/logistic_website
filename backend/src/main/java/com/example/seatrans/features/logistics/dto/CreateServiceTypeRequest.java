package com.example.seatrans.features.logistics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateServiceTypeRequest {
    private String name;
    private String displayName;
    private String description;
}

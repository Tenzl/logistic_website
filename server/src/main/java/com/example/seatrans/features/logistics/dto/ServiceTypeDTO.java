package com.example.seatrans.features.logistics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceTypeDTO {
    private Long id;
    private String name;
    private String displayName;
    private String description;
    private Boolean isActive;
}

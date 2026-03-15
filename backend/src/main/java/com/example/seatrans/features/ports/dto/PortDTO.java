package com.example.seatrans.features.ports.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortDTO {
    private Long id;
    private String name;
    private String portOfCall;
    private Long provinceId;
    private String provinceName;
    private Boolean isActive;
}

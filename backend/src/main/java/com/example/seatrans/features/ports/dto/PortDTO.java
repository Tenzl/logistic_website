package com.example.seatrans.features.ports.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private String zoneCode;
    private String countryCode;
    private String code;
    private BigDecimal longitude;
    private BigDecimal latitude;
    private Boolean isActive;
    private Integer hasInfo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

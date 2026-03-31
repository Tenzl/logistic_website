package com.example.seatrans.features.ports.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePortRequest {
    private String name;
    private String portOfCall;
    private Long provinceId;

    private String zoneCode;
    private String countryCode;
    private String code;
    private BigDecimal longitude;
    private BigDecimal latitude;

    private Boolean isActive;
    private Integer hasInfo;
}

package com.example.seatrans.features.logistics.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOfficeRequest {
    private Long provinceId;
    private String name;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String managerName;
    private String managerTitle;
    private String managerMobile;
    private String managerEmail;
    private Boolean isHeadquarter;
    private Boolean isActive;
}

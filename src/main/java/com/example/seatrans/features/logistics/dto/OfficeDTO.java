package com.example.seatrans.features.logistics.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficeDTO {
    private Long id;
    private String name;
    private String city;
    private String region;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private ManagerDTO manager;
    private CoordinatesDTO coordinates;
    private Boolean isHeadquarter;
    private Boolean isActive;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ManagerDTO {
        private String name;
        private String title;
        private String mobile;
        private String email;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CoordinatesDTO {
        private BigDecimal lat;
        private BigDecimal lng;
    }
}

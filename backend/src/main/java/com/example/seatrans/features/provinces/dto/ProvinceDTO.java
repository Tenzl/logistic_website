package com.example.seatrans.features.provinces.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProvinceDTO {
    private Long id;
    private String name;
    private int portCount;
    private List<String> ports;
    private Boolean isActive;
}

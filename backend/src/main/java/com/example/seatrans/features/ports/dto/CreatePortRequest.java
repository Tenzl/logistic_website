package com.example.seatrans.features.ports.dto;

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
}

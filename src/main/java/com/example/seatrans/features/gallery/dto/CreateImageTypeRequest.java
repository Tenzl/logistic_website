package com.example.seatrans.features.gallery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateImageTypeRequest {
    private Long serviceTypeId;
    private String name;
    private String displayName;
    private String description;
    private Integer requiredImageCount;
}

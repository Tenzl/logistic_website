package com.example.seatrans.features.gallery.model;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CargoTypeCatalogId implements Serializable {
    private String serviceTypeType;
    private String code;
}

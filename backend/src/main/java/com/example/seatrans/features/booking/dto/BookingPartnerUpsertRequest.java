package com.example.seatrans.features.booking.dto;

import java.util.Set;

import com.example.seatrans.features.booking.model.CustomerStatus;
import com.example.seatrans.features.booking.model.CustomerType;
import com.example.seatrans.features.booking.model.PartnerAdditionType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class BookingPartnerUpsertRequest {

    @NotBlank(message = "name is required")
    private String name;

    @NotEmpty(message = "additionTypes is required")
    private Set<PartnerAdditionType> additionTypes;

    private String country;
    private String city;
    private String contactEmail;
    private String phone;
    private String fax;
    private String trackingUrl;
    private String address;

    private CustomerStatus customerStatus;
    private CustomerType customerType;

    private String taxNumber;
}

package com.example.seatrans.features.booking.dto;

import com.example.seatrans.features.booking.model.CustomerStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateCustomerStatusRequest {

    @NotNull(message = "customerStatus is required")
    private CustomerStatus customerStatus;
}

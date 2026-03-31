package com.example.seatrans.features.booking.dto;

import java.time.LocalDateTime;
import java.util.Set;

import com.example.seatrans.features.booking.model.BookingPartner;
import com.example.seatrans.features.booking.model.CustomerStatus;
import com.example.seatrans.features.booking.model.CustomerType;
import com.example.seatrans.features.booking.model.PartnerAdditionType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingPartnerListItemResponse {
    private Long id;
    private String customerId;
    private String name;
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
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    public static BookingPartnerListItemResponse from(BookingPartner partner) {
        return BookingPartnerListItemResponse.builder()
            .id(partner.getId())
            .customerId(partner.getCustomerId())
            .name(partner.getName())
            .additionTypes(partner.getAdditionTypes())
            .country(partner.getCountry())
            .city(partner.getCity())
            .contactEmail(partner.getContactEmail())
            .phone(partner.getPhone())
            .fax(partner.getFax())
            .trackingUrl(partner.getTrackingUrl())
            .address(partner.getAddress())
            .customerStatus(partner.getCustomerStatus())
            .customerType(partner.getCustomerType())
            .taxNumber(partner.getTaxNumber())
            .createdBy(partner.getCreatedBy())
            .createdAt(partner.getCreatedAt())
            .updatedBy(partner.getUpdatedBy())
            .updatedAt(partner.getUpdatedAt())
            .deletedAt(partner.getDeletedAt())
            .build();
    }
}

package com.example.seatrans.features.inquiry.service;

import org.springframework.stereotype.Service;

import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.auth.service.UserService;
import com.example.seatrans.features.inquiry.dto.CharteringBrokingInquiryResponse;
import com.example.seatrans.features.inquiry.dto.FreightForwardingInquiryResponse;
import com.example.seatrans.features.inquiry.dto.ShippingAgencyInquiryResponse;
import com.example.seatrans.features.inquiry.dto.SpecialRequestInquiryResponse;
import com.example.seatrans.features.inquiry.dto.TotalLogisticInquiryResponse;

import lombok.RequiredArgsConstructor;

/**
 * Service to enrich inquiry responses with user information
 */
@Service
@RequiredArgsConstructor
public class InquiryResponseEnricher {
    
    private final UserService userService;
    
    public ShippingAgencyInquiryResponse enrichShippingAgency(ShippingAgencyInquiryResponse response) {
        if (response.getUserId() != null) {
            try {
                User user = userService.getUserById(response.getUserId());
                if (user != null) {
                    response.setFullName(user.getFullName());
                    response.setEmail(user.getEmail());
                    response.setPhone(user.getPhone());
                    response.setCompany(user.getCompany());
                }
            } catch (Exception e) {
                // User not found or error fetching user, keep fields null
                // Log the error for debugging but don't propagate
            }
        }
        return response;
    }
    
    public FreightForwardingInquiryResponse enrichFreightForwarding(FreightForwardingInquiryResponse response) {
        if (response.getUserId() != null) {
            try {
                User user = userService.getUserById(response.getUserId());
                response.setFullName(user.getFullName());
                response.setEmail(user.getEmail());
                response.setPhone(user.getPhone());
                response.setCompany(user.getCompany());
            } catch (Exception ignored) {
                // User not found, keep fields null
            }
        }
        return response;
    }
    
    public CharteringBrokingInquiryResponse enrichChartering(CharteringBrokingInquiryResponse response) {
        if (response.getUserId() != null) {
            try {
                User user = userService.getUserById(response.getUserId());
                response.setFullName(user.getFullName());
                response.setEmail(user.getEmail());
                response.setPhone(user.getPhone());
                response.setCompany(user.getCompany());
            } catch (Exception ignored) {
                // User not found, keep fields null
            }
        }
        return response;
    }
    
    public TotalLogisticInquiryResponse enrichLogistics(TotalLogisticInquiryResponse response) {
        if (response.getUserId() != null) {
            try {
                User user = userService.getUserById(response.getUserId());
                response.setFullName(user.getFullName());
                response.setEmail(user.getEmail());
                response.setPhone(user.getPhone());
                response.setCompany(user.getCompany());
            } catch (Exception ignored) {
                // User not found, keep fields null
            }
        }
        return response;
    }
    
    public SpecialRequestInquiryResponse enrichSpecialRequest(SpecialRequestInquiryResponse response) {
        if (response.getUserId() != null) {
            try {
                User user = userService.getUserById(response.getUserId());
                response.setFullName(user.getFullName());
                response.setEmail(user.getEmail());
                response.setPhone(user.getPhone());
                response.setCompany(user.getCompany());
            } catch (Exception ignored) {
                // User not found, keep fields null
            }
        }
        return response;
    }
}

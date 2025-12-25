package com.example.seatrans.features.user.dto;

import java.time.LocalDateTime;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho User response (khÃ´ng tráº£ vá» password)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String company;
    private String nation;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;
    private Set<String> roles; // Chá»‰ tráº£ vá» tÃªn roles
    private String roleGroup; // INTERNAL hoáº·c EXTERNAL

    // Customer/Employee info flags
    private Boolean hasCustomerInfo;
    private Boolean hasEmployeeInfo;
}

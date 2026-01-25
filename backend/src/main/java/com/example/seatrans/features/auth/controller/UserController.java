package com.example.seatrans.features.auth.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.auth.dto.UserDTO;
import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.auth.service.UserService;
import com.example.seatrans.shared.dto.ApiResponse;
import com.example.seatrans.shared.mapper.EntityMapper;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

/**
 * Controller for user self-service profile management
 * For admin user management, see AdminUserController
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    
    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final EntityMapper entityMapper;
    
    // ==================== User Self-Service Operations ====================
    
    /**
     * GET /api/v1/users/profile/me
     * Get current user's profile
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/profile/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUserProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        log.debug("Fetching profile for user ID: {}", userId);
        
        User user = userService.getUserById(userId);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success(userDTO));
    }
    
    /**
     * PUT /api/v1/users/profile/me
     * Update current user's profile
     */
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/profile/me")
    public ResponseEntity<ApiResponse<UserDTO>> updateCurrentUserProfile(
            @RequestBody User updatedUser, 
            HttpServletRequest request) {
        
        Long userId = (Long) request.getAttribute("userId");
        log.info("Updating profile for user ID: {}", userId);
        log.debug("Update data: fullName={}, phone={}, company={}", 
            updatedUser.getFullName(), updatedUser.getPhone(), updatedUser.getCompany());
        
        try {
            User user = userService.updateUser(userId, updatedUser);
            UserDTO userDTO = entityMapper.toUserDTO(user);
            
            log.info("User {} profile updated successfully", userId);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", userDTO));
        } catch (Exception e) {
            log.error("Failed to update user {} profile: {}", userId, e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to update profile: " + e.getMessage()));
        }
    }
}
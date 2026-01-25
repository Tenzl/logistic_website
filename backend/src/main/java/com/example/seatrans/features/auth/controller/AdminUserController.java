package com.example.seatrans.features.auth.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.auth.dto.UserDTO;
import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.auth.service.UserService;
import com.example.seatrans.shared.dto.ApiResponse;
import com.example.seatrans.shared.mapper.EntityMapper;

import lombok.RequiredArgsConstructor;

/**
 * Admin Controller - Quản trị users (Internal)
 * Tất cả endpoints yêu cầu ROLE_ADMIN
 */
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminUserController {
    
    private final UserService userService;
    private final EntityMapper entityMapper;
    
    // ==================== Read Operations ====================
    
    /**
     * GET /api/v1/admin/users
     * Lấy tất cả users
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserDTO> userDTOs = users.stream()
                .map(entityMapper::toUserDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(userDTOs));
    }
    
    /**
     * GET /api/admin/users/{id}
     * Lấy user theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success(userDTO));
    }
    
    /**
     * GET /api/admin/users/email/{email}
     * Lấy user theo email
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByEmail(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success(userDTO));
    }
    
    /**
     * GET /api/admin/users/active
     * Lấy active users
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getActiveUsers() {
        List<User> users = userService.getActiveUsers();
        List<UserDTO> userDTOs = users.stream()
                .map(entityMapper::toUserDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(userDTOs));
    }
    
    // ==================== Update Operations ====================
    
    /**
     * PUT /api/admin/users/{id}/activate
     * Activate user
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<UserDTO>> activateUser(@PathVariable Long id) {
        User user = userService.activateUser(id);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success("User activated", userDTO));
    }
    
    /**
     * PUT /api/admin/users/{id}/deactivate
     * Deactivate user
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<UserDTO>> deactivateUser(@PathVariable Long id) {
        User user = userService.deactivateUser(id);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success("User deactivated", userDTO));
    }
    
    // ==================== Role Management ====================
    
    /**
     * POST /api/admin/users/{id}/roles
     * Gán role cho user
     */
    @PostMapping("/{id}/roles")
    public ResponseEntity<ApiResponse<UserDTO>> assignRole(
            @PathVariable Long id,
            @RequestParam String roleName) {
        
        User user = userService.assignRole(id, roleName);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success("Role assigned successfully", userDTO));
    }
    
    // ==================== Delete Operations ====================
    
    /**
     * DELETE /api/admin/users/{id}
     * Xóa user
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
}

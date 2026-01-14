package com.example.seatrans.features.auth.controller;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.auth.dto.UserDTO;
import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.auth.model.enums.RoleGroup;
import com.example.seatrans.features.auth.service.UserService;
import com.example.seatrans.shared.dto.ApiResponse;
import com.example.seatrans.shared.mapper.EntityMapper;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

/**
 * Controller xá»­ lÃ½ User management
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final EntityMapper entityMapper;
    
    // ==================== Read Operations ====================
    
    /**
     * GET /api/users
     * Láº¥y táº¥t cáº£ users
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserDTO> userDTOs = users.stream()
                .map(entityMapper::toUserDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(userDTOs));
    }
    
    /**
     * GET /api/users/{id}
     * Láº¥y user theo ID
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success(userDTO));
    }
    
    /**
     * GET /api/users/email/{email}
     * Láº¥y user theo email
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByEmail(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success(userDTO));
    }
    
    /**
     * GET /api/users/active
     * Láº¥y active users
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getActiveUsers() {
        List<User> users = userService.getActiveUsers();
        List<UserDTO> userDTOs = users.stream()
                .map(entityMapper::toUserDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(userDTOs));
    }
    
    /**
     * GET /api/users/role/{roleName}
     * Láº¥y users theo role
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/role/{roleName}")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getUsersByRole(@PathVariable String roleName) {
        List<User> users = userService.getUsersByRole(roleName);
        List<UserDTO> userDTOs = users.stream()
                .map(entityMapper::toUserDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(userDTOs));
    }
    
    /**
     * GET /api/users/rolegroup/{roleGroup}
     * Láº¥y users theo role group
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/rolegroup/{roleGroup}")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getUsersByRoleGroup(@PathVariable RoleGroup roleGroup) {
        List<User> users = userService.getUsersByRoleGroup(roleGroup);
        List<UserDTO> userDTOs = users.stream()
                .map(entityMapper::toUserDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(userDTOs));
    }
    
    /**
     * GET /api/users/search?keyword={keyword}
     * TÃ¬m kiáº¿m users
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserDTO>>> searchUsers(@RequestParam String keyword) {
        List<User> users = userService.searchUsers(keyword);
        List<UserDTO> userDTOs = users.stream()
                .map(entityMapper::toUserDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(userDTOs));
    }
    
    // ==================== Update Operations ====================
    
    /**
     * PUT /api/users/{id}
     * Cáº­p nháº­t user info
     * ROLE_ADMIN: can update any user
     * Regular users: can only update their own profile
     */
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(@PathVariable Long id, @RequestBody User updatedUser, HttpServletRequest request) {
        
        log.info("Updating user ID: {}", id);
        log.debug("Update data: fullName={}, phone={}, company={}", 
            updatedUser.getFullName(), updatedUser.getPhone(), updatedUser.getCompany());
        
        try {
            // Check if user is admin or updating their own profile
            Long requestUserId = (Long) request.getAttribute("userId");
            boolean isAdmin = request.isUserInRole("ROLE_ADMIN");
            log.debug("Request userId: {}, isAdmin: {}, target userId: {}", requestUserId, isAdmin, id);
            
            if (!isAdmin && !id.equals(requestUserId)) {
                log.warn("User {} attempted to update user {} without permission", requestUserId, id);
                return ResponseEntity.status(403)
                    .body(ApiResponse.error("Access denied. You can only update your own profile."));
            }
            
            User user = userService.updateUser(id, updatedUser);
            UserDTO userDTO = entityMapper.toUserDTO(user);
            
            log.info("User {} updated successfully", id);
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", userDTO));
        } catch (Exception e) {
            log.error("Failed to update user {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to update user: " + e.getMessage()));
        }
    }
    
    /**
     * PUT /api/users/{id}/activate
     * Activate user
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<UserDTO>> activateUser(@PathVariable Long id) {
        User user = userService.activateUser(id);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success("User activated", userDTO));
    }
    
    /**
     * PUT /api/users/{id}/deactivate
     * Deactivate user
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<UserDTO>> deactivateUser(@PathVariable Long id) {
        User user = userService.deactivateUser(id);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success("User deactivated", userDTO));
    }
    
    // ==================== Role Management ====================
    
    /**
     * POST /api/users/{id}/roles
     * GÃ¡n role cho user
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/{id}/roles")
    public ResponseEntity<ApiResponse<UserDTO>> assignRole(
            @PathVariable Long id,
            @RequestParam String roleName) {
        
        User user = userService.assignRole(id, roleName);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success("Role assigned successfully", userDTO));
    }
    
    /**
     * POST /api/users/{id}/roles/batch
     * GÃ¡n nhiá»u roles cho user
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/{id}/roles/batch")
    public ResponseEntity<ApiResponse<UserDTO>> assignRoles(
            @PathVariable Long id,
            @RequestBody Set<String> roleNames) {
        
        User user = userService.assignRoles(id, roleNames);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success("Roles assigned successfully", userDTO));
    }
    
    /**
     * DELETE /api/users/{id}/roles/{roleName}
     * XÃ³a role khá»i user
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}/roles/{roleName}")
    public ResponseEntity<ApiResponse<UserDTO>> removeRole(
            @PathVariable Long id,
            @PathVariable String roleName) {
        
        User user = userService.removeRole(id, roleName);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success("Role removed successfully", userDTO));
    }
    
    /**
     * DELETE /api/users/{id}/roles
     * XÃ³a táº¥t cáº£ roles cá»§a user
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}/roles")
    public ResponseEntity<ApiResponse<UserDTO>> clearRoles(@PathVariable Long id) {
        User user = userService.clearRoles(id);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success("All roles removed", userDTO));
    }
    
    // ==================== Delete Operations ====================
    
    /**
     * DELETE /api/users/{id}
     * XÃ³a user
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
    
    // ==================== Statistics ====================
    
    /**
     * GET /api/users/stats/count
     * Äáº¿m tá»•ng sá»‘ users
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/stats/count")
    public ResponseEntity<ApiResponse<Long>> countTotalUsers() {
        Long count = userService.countTotalUsers();
        
        return ResponseEntity.ok(ApiResponse.success(count));
    }
    
    /**
     * GET /api/users/stats/active-count
     * Äáº¿m active users
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/stats/active-count")
    public ResponseEntity<ApiResponse<Long>> countActiveUsers() {
        Long count = userService.countActiveUsers();
        
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}



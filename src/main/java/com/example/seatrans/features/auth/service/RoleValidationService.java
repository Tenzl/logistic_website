package com.example.seatrans.features.auth.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.seatrans.features.auth.model.Role;
import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.auth.model.enums.RoleGroup;
import com.example.seatrans.shared.exception.RoleGroupConflictException;

/**
 * Service xử lý validation cho Role Groups
 * Đảm bảo user không thể có roles từ 2 groups khác nhau
 */
@Service
public class RoleValidationService {
    
    /**
     * Kiểm tra xem có thể gán role cho user không
     * Không cho phép mix INTERNAL và EXTERNAL roles
     * 
     * @param user User cần kiểm tra
     * @param newRole Role mới muốn gán
     * @throws RoleGroupConflictException nếu role groups conflict
     */
    public void validateRoleAssignment(User user, Role newRole) {
        if (user.getRoles().isEmpty()) {
            // User chưa có role nào, cho phép gán
            return;
        }
        
        RoleGroup currentGroup = user.getRoleGroup();
        RoleGroup newGroup = newRole.getRoleGroup();
        
        if (currentGroup != newGroup) {
            throw new RoleGroupConflictException(
                String.format("Cannot assign %s role '%s' to user with %s roles. " +
                            "User can only have roles from one group (INTERNAL or EXTERNAL). " +
                            "Current roles: %s",
                            newGroup, 
                            newRole.getName(),
                            currentGroup,
                            user.getRoleNames())
            );
        }
    }
    
    /**
     * Kiểm tra xem có thể gán nhiều roles cho user không
     * Tất cả roles phải cùng group
     * 
     * @param user User cần kiểm tra
     * @param newRoles Danh sách roles mới
     * @throws RoleGroupConflictException nếu có conflict
     */
    public void validateRoleAssignments(User user, Set<Role> newRoles) {
        if (newRoles.isEmpty()) {
            return;
        }
        
        // Kiểm tra các roles mới có cùng group không
        Set<RoleGroup> newGroups = newRoles.stream()
            .map(Role::getRoleGroup)
            .collect(Collectors.toSet());
        
        if (newGroups.size() > 1) {
            throw new RoleGroupConflictException(
                "Cannot assign roles from different groups at the same time. " +
                "All roles must belong to the same group (INTERNAL or EXTERNAL)."
            );
        }
        
        // Kiểm tra với roles hiện tại của user
        if (!user.getRoles().isEmpty()) {
            RoleGroup currentGroup = user.getRoleGroup();
            RoleGroup newGroup = newGroups.iterator().next();
            
            if (currentGroup != newGroup) {
                throw new RoleGroupConflictException(
                    String.format("Cannot assign %s roles to user with %s roles. " +
                                "Current roles: %s. New roles: %s",
                                newGroup,
                                currentGroup,
                                user.getRoleNames(),
                                newRoles.stream().map(Role::getName).collect(Collectors.toSet()))
                );
            }
        }
    }
    
    /**
     * Kiểm tra xem user có thể chuyển sang role group mới không
     * Yêu cầu xóa hết roles hiện tại trước
     * 
     * @param user User cần kiểm tra
     * @param newRole Role thuộc group mới
     * @throws RoleGroupConflictException nếu user còn roles cũ
     */
    public void validateRoleSwitch(User user, Role newRole) {
        RoleGroup currentGroup = user.getRoleGroup();
        RoleGroup newGroup = newRole.getRoleGroup();
        
        if (currentGroup != null && currentGroup != newGroup) {
            throw new RoleGroupConflictException(
                String.format("Cannot switch from %s to %s role group. " +
                            "Please remove all current roles first. Current roles: %s",
                            currentGroup, 
                            newGroup,
                            user.getRoleNames())
            );
        }
    }
    
    /**
     * Lấy danh sách roles được phép gán cho user
     * Nếu user chưa có role, trả về tất cả
     * Nếu user đã có role, chỉ trả về roles cùng group
     * 
     * @param user User cần kiểm tra
     * @param allRoles Danh sách tất cả roles
     * @return Danh sách roles được phép gán
     */
    public List<Role> getAllowedRoles(User user, List<Role> allRoles) {
        if (user.getRoles().isEmpty()) {
            // User chưa có role, cho phép tất cả
            return allRoles;
        }
        
        RoleGroup userGroup = user.getRoleGroup();
        return allRoles.stream()
            .filter(role -> role.getRoleGroup() == userGroup)
            .collect(Collectors.toList());
    }
    
    /**
     * Kiểm tra xem roles có compatible với nhau không
     * Tất cả phải cùng group
     * 
     * @param roles Danh sách roles cần kiểm tra
     * @return true nếu compatible, false nếu không
     */
    public boolean areRolesCompatible(Set<Role> roles) {
        if (roles.isEmpty() || roles.size() == 1) {
            return true;
        }
        
        Set<RoleGroup> groups = roles.stream()
            .map(Role::getRoleGroup)
            .collect(Collectors.toSet());
        
        return groups.size() == 1;
    }
    
    /**
     * Lấy role group từ danh sách roles
     * Trả về null nếu empty hoặc có conflict
     * 
     * @param roles Danh sách roles
     * @return RoleGroup chung hoặc null
     */
    public RoleGroup getRoleGroupFromRoles(Set<Role> roles) {
        if (roles.isEmpty()) {
            return null;
        }
        
        Set<RoleGroup> groups = roles.stream()
            .map(Role::getRoleGroup)
            .collect(Collectors.toSet());
        
        if (groups.size() > 1) {
            return null; // Conflict
        }
        
        return groups.iterator().next();
    }
    
    /**
     * Validate toàn bộ user data về roles
     * Kiểm tra tất cả business rules
     * 
     * @param user User cần validate
     * @throws RoleGroupConflictException nếu có lỗi
     */
    public void validateUserRoles(User user) {
        if (user.getRoles().isEmpty()) {
            return;
        }
        
        // Kiểm tra roles có compatible không
        if (!areRolesCompatible(user.getRoles())) {
            throw new RoleGroupConflictException(
                "User has roles from multiple groups: " + 
                user.getRoles().stream()
                    .map(r -> r.getName() + " (" + r.getRoleGroup() + ")")
                    .collect(Collectors.joining(", "))
            );
        }
    }
}

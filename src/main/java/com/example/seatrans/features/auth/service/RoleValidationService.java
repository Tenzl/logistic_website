package com.example.seatrans.features.auth.service;

import org.springframework.stereotype.Service;

import com.example.seatrans.features.auth.model.Role;
import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.auth.model.enums.RoleGroup;
import com.example.seatrans.shared.exception.RoleGroupConflictException;

/**
 * Service xử lý validation cho Role Groups
 * Single-role validation helpers (user now owns one role_id)
 */
@Service
public class RoleValidationService {
    
    /**
     * Validate assigning a role to a user. With single-role model we only guard against
     * switching between INTERNAL/EXTERNAL in a way the business disallows.
     */
    public void validateRoleAssignment(User user, Role newRole) {
        if (newRole == null || user.getRole() == null) {
            return;
        }

        RoleGroup currentGroup = user.getRoleGroup();
        RoleGroup newGroup = newRole.getRoleGroup();

        if (currentGroup != null && newGroup != null && currentGroup != newGroup) {
            throw new RoleGroupConflictException(
                String.format("Cannot switch user from %s to %s without explicit approval.",
                        currentGroup, newGroup)
            );
        }
    }

    /**
     * Validate a user's current role data.
     */
    public void validateUserRole(User user) {
        if (user.getRole() == null) {
            return;
        }
        // Nothing else to validate for single-role model at the moment.
    }
}

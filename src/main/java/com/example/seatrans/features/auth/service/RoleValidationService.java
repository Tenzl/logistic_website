package com.example.seatrans.features.auth.service;

import com.example.seatrans.features.auth.model.Role;
import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.auth.model.enums.RoleGroup;
import com.example.seatrans.shared.exception.RoleGroupConflictException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service xá»­ lÃ½ validation cho Role Groups
 * Äáº£m báº£o user khÃ´ng thá»ƒ cÃ³ roles tá»« 2 groups khÃ¡c nhau
 */
@Service
public class RoleValidationService {
    
    /**
     * Kiá»ƒm tra xem cÃ³ thá»ƒ gÃ¡n role cho user khÃ´ng
     * KhÃ´ng cho phÃ©p mix INTERNAL vÃ  EXTERNAL roles
     * 
     * @param user User cáº§n kiá»ƒm tra
     * @param newRole Role má»›i muá»‘n gÃ¡n
     * @throws RoleGroupConflictException náº¿u role groups conflict
     */
    public void validateRoleAssignment(User user, Role newRole) {
        if (user.getRoles().isEmpty()) {
            // User chÆ°a cÃ³ role nÃ o, cho phÃ©p gÃ¡n
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
     * Kiá»ƒm tra xem cÃ³ thá»ƒ gÃ¡n nhiá»u roles cho user khÃ´ng
     * Táº¥t cáº£ roles pháº£i cÃ¹ng group
     * 
     * @param user User cáº§n kiá»ƒm tra
     * @param newRoles Danh sÃ¡ch roles má»›i
     * @throws RoleGroupConflictException náº¿u cÃ³ conflict
     */
    public void validateRoleAssignments(User user, Set<Role> newRoles) {
        if (newRoles.isEmpty()) {
            return;
        }
        
        // Kiá»ƒm tra cÃ¡c roles má»›i cÃ³ cÃ¹ng group khÃ´ng
        Set<RoleGroup> newGroups = newRoles.stream()
            .map(Role::getRoleGroup)
            .collect(Collectors.toSet());
        
        if (newGroups.size() > 1) {
            throw new RoleGroupConflictException(
                "Cannot assign roles from different groups at the same time. " +
                "All roles must belong to the same group (INTERNAL or EXTERNAL)."
            );
        }
        
        // Kiá»ƒm tra vá»›i roles hiá»‡n táº¡i cá»§a user
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
     * Kiá»ƒm tra xem user cÃ³ thá»ƒ chuyá»ƒn sang role group má»›i khÃ´ng
     * YÃªu cáº§u xÃ³a háº¿t roles hiá»‡n táº¡i trÆ°á»›c
     * 
     * @param user User cáº§n kiá»ƒm tra
     * @param newRole Role thuá»™c group má»›i
     * @throws RoleGroupConflictException náº¿u user cÃ²n roles cÅ©
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
     * Láº¥y danh sÃ¡ch roles Ä‘Æ°á»£c phÃ©p gÃ¡n cho user
     * Náº¿u user chÆ°a cÃ³ role, tráº£ vá» táº¥t cáº£
     * Náº¿u user Ä‘Ã£ cÃ³ role, chá»‰ tráº£ vá» roles cÃ¹ng group
     * 
     * @param user User cáº§n kiá»ƒm tra
     * @param allRoles Danh sÃ¡ch táº¥t cáº£ roles
     * @return Danh sÃ¡ch roles Ä‘Æ°á»£c phÃ©p gÃ¡n
     */
    public List<Role> getAllowedRoles(User user, List<Role> allRoles) {
        if (user.getRoles().isEmpty()) {
            // User chÆ°a cÃ³ role, cho phÃ©p táº¥t cáº£
            return allRoles;
        }
        
        RoleGroup userGroup = user.getRoleGroup();
        return allRoles.stream()
            .filter(role -> role.getRoleGroup() == userGroup)
            .collect(Collectors.toList());
    }
    
    /**
     * Kiá»ƒm tra xem role group cÃ³ há»£p lá»‡ cho user type khÃ´ng
     * VD: Customer chá»‰ cÃ³ thá»ƒ cÃ³ EXTERNAL roles
     * 
     * @param hasCustomerInfo User cÃ³ customer information
     * @param hasEmployeeInfo User cÃ³ employee information
     * @param role Role cáº§n kiá»ƒm tra
     * @throws RoleGroupConflictException náº¿u khÃ´ng há»£p lá»‡
     */
    public void validateRoleForUserType(boolean hasCustomerInfo, boolean hasEmployeeInfo, Role role) {
        if (hasCustomerInfo && role.getRoleGroup() != RoleGroup.EXTERNAL) {
            throw new RoleGroupConflictException(
                "Customer users can only have EXTERNAL roles (ROLE_CUSTOMER). " +
                "Cannot assign INTERNAL role: " + role.getName()
            );
        }
        
        if (hasEmployeeInfo && role.getRoleGroup() != RoleGroup.INTERNAL) {
            throw new RoleGroupConflictException(
                "Employee users can only have INTERNAL roles (ROLE_ADMIN, ROLE_EMPLOYEE). " +
                "Cannot assign EXTERNAL role: " + role.getName()
            );
        }
    }
    
    /**
     * Kiá»ƒm tra xem roles cÃ³ compatible vá»›i nhau khÃ´ng
     * Táº¥t cáº£ pháº£i cÃ¹ng group
     * 
     * @param roles Danh sÃ¡ch roles cáº§n kiá»ƒm tra
     * @return true náº¿u compatible, false náº¿u khÃ´ng
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
     * Láº¥y role group tá»« danh sÃ¡ch roles
     * Tráº£ vá» null náº¿u empty hoáº·c cÃ³ conflict
     * 
     * @param roles Danh sÃ¡ch roles
     * @return RoleGroup chung hoáº·c null
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
     * Validate toÃ n bá»™ user data vá» roles
     * Kiá»ƒm tra táº¥t cáº£ business rules
     * 
     * @param user User cáº§n validate
     * @throws RoleGroupConflictException náº¿u cÃ³ lá»—i
     */
    public void validateUserRoles(User user) {
        if (user.getRoles().isEmpty()) {
            return;
        }
        
        // Kiá»ƒm tra roles cÃ³ compatible khÃ´ng
        if (!areRolesCompatible(user.getRoles())) {
            throw new RoleGroupConflictException(
                "User has roles from multiple groups: " + 
                user.getRoles().stream()
                    .map(r -> r.getName() + " (" + r.getRoleGroup() + ")")
                    .collect(Collectors.joining(", "))
            );
        }
        
        // Kiá»ƒm tra role group phÃ¹ há»£p vá»›i user type
        RoleGroup group = user.getRoleGroup();
        boolean hasCustomer = user.getCustomer() != null;
        boolean hasEmployee = user.getEmployee() != null;
        
        if (hasCustomer && group != RoleGroup.EXTERNAL) {
            throw new RoleGroupConflictException(
                "User has Customer information but has INTERNAL roles. " +
                "Customer users must have EXTERNAL roles only."
            );
        }
        
        if (hasEmployee && group != RoleGroup.INTERNAL) {
            throw new RoleGroupConflictException(
                "User has Employee information but has EXTERNAL roles. " +
                "Employee users must have INTERNAL roles only."
            );
        }
    }
}



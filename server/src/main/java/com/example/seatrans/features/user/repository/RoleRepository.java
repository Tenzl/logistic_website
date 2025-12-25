package com.example.seatrans.features.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.user.model.Role;
import com.example.seatrans.features.user.model.enums.RoleGroup;

/**
 * Repository interface cho Role entity
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    // ==================== Basic Queries ====================

    /**
     * TÃ¬m role theo tÃªn
     * VD: "ROLE_ADMIN", "ROLE_EMPLOYEE", "ROLE_CUSTOMER"
     */
    Optional<Role> findByName(String name);

    /**
     * Kiá»ƒm tra role name Ä‘Ã£ tá»“n táº¡i chÆ°a
     */
    boolean existsByName(String name);

    // ==================== Role Group Queries ====================

    /**
     * Láº¥y táº¥t cáº£ roles thuá»™c role group
     */
    List<Role> findByRoleGroup(RoleGroup roleGroup);

    /**
     * Láº¥y táº¥t cáº£ INTERNAL roles (Admin, Employee)
     */
    @Query("SELECT r FROM Role r WHERE r.roleGroup = 'INTERNAL'")
    List<Role> findInternalRoles();

    /**
     * Láº¥y táº¥t cáº£ EXTERNAL roles (Customer)
     */
    @Query("SELECT r FROM Role r WHERE r.roleGroup = 'EXTERNAL'")
    List<Role> findExternalRoles();

    // ==================== Search Queries ====================

    /**
     * TÃ¬m kiáº¿m roles theo tÃªn hoáº·c description
     */
    @Query("SELECT r FROM Role r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Role> searchByNameOrDescription(@Param("keyword") String keyword);

    /**
     * TÃ¬m roles theo description
     */
    List<Role> findByDescriptionContainingIgnoreCase(String description);

    // ==================== Statistics Queries ====================

    /**
     * Äáº¿m sá»‘ users cÃ³ role nÃ y
     */
    @Query("SELECT COUNT(u) FROM Role r JOIN r.users u WHERE r.id = :roleId")
    Long countUsersByRoleId(@Param("roleId") Long roleId);

    /**
     * Äáº¿m sá»‘ users theo role name
     */
    @Query("SELECT COUNT(u) FROM Role r JOIN r.users u WHERE r.name = :roleName")
    Long countUsersByRoleName(@Param("roleName") String roleName);

    /**
     * Kiá»ƒm tra role cÃ³ users khÃ´ng (Ä‘á»ƒ xÃ¡c Ä‘á»‹nh cÃ³ thá»ƒ xÃ³a khÃ´ng)
     */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM Role r JOIN r.users u WHERE r.id = :roleId")
    boolean hasUsers(@Param("roleId") Long roleId);

    /**
     * Láº¥y roles chÆ°a Ä‘Æ°á»£c gÃ¡n cho user nÃ o
     */
    @Query("SELECT r FROM Role r WHERE SIZE(r.users) = 0")
    List<Role> findUnassignedRoles();

    /**
     * Äáº¿m sá»‘ roles theo role group
     */
    Long countByRoleGroup(RoleGroup roleGroup);
}

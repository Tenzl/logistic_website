package com.example.seatrans.features.auth.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.auth.model.enums.RoleGroup;

/**
 * Repository interface cho User entity
 * Cung cấp các phương thức CRUD và query tùy chỉnh
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByOauthProviderAndOauthProviderId(String oauthProvider, String oauthProviderId);

    // ==================== Status Queries ====================
    List<User> findByIsActiveTrue();
    List<User> findByIsActiveFalse();
    List<User> findByIsActive(Boolean isActive);

    // ==================== Role Queries ====================
    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.roleGroup = :roleGroup")
    List<User> findByRoleGroup(@Param("roleGroup") RoleGroup roleGroup);

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.roleGroup = 'INTERNAL'")
    List<User> findInternalUsers();

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.roleGroup = 'EXTERNAL'")
    List<User> findExternalUsers();

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM User u JOIN u.roles r WHERE u.id = :userId AND r.name = :roleName")
    boolean hasRole(@Param("userId") Long userId, @Param("roleName") String roleName);

    // ==================== Date Range Queries ====================
    List<User> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<User> findByLastLoginAfter(LocalDateTime date);

    @Query("SELECT u FROM User u WHERE u.lastLogin IS NULL OR u.lastLogin < :date")
    List<User> findInactiveUsersSince(@Param("date") LocalDateTime date);

    // ==================== Search Queries ====================
    @Query("SELECT u FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> searchByEmailOrFullName(@Param("keyword") String keyword);

    List<User> findByFullNameContainingIgnoreCase(String fullName);

    Optional<User> findByPhone(String phone);

    // ==================== Complex Queries ====================
    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r.roleGroup = :roleGroup")
    Long countByRoleGroup(@Param("roleGroup") RoleGroup roleGroup);

    List<User> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE u.isActive = true AND r.name = :roleName")
    List<User> findActiveUsersByRole(@Param("roleName") String roleName);

    // ==================== Statistics Queries ====================
    @Query("SELECT COUNT(u) FROM User u")
    Long countTotalUsers();

    Long countByIsActiveTrue();

    Long countByIsActiveFalse();

    @Query("SELECT COUNT(u) FROM User u WHERE YEAR(u.createdAt) = YEAR(CURRENT_DATE) AND MONTH(u.createdAt) = MONTH(CURRENT_DATE)")
    Long countUsersCreatedThisMonth();
}



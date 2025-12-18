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
 * Cung cáº¥p cÃ¡c phÆ°Æ¡ng thá»©c CRUD vÃ  query tÃ¹y chá»‰nh
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // ==================== Basic Queries ====================
    
    /**
     * TÃ¬m user theo username
     * DÃ¹ng Optional Ä‘á»ƒ xá»­ lÃ½ trÆ°á»ng há»£p khÃ´ng tÃ¬m tháº¥y
     */
    Optional<User> findByUsername(String username);
    
    /**
     * TÃ¬m user theo email
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Kiá»ƒm tra username Ä‘Ã£ tá»“n táº¡i chÆ°a
     */
    boolean existsByUsername(String username);
    
    /**
     * Kiá»ƒm tra email Ä‘Ã£ tá»“n táº¡i chÆ°a
     */
    boolean existsByEmail(String email);
    
    // ==================== Status Queries ====================
    
    /**
     * Láº¥y táº¥t cáº£ users Ä‘ang active
     */
    List<User> findByIsActiveTrue();
    
    /**
     * Láº¥y táº¥t cáº£ users bá»‹ vÃ´ hiá»‡u hÃ³a
     */
    List<User> findByIsActiveFalse();
    
    /**
     * TÃ¬m users theo tráº¡ng thÃ¡i active
     */
    List<User> findByIsActive(Boolean isActive);
    
    // ==================== Role Queries ====================
    
    /**
     * TÃ¬m users cÃ³ role cá»¥ thá»ƒ
     * Join vá»›i báº£ng roles qua user_roles
     */
    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);
    
    /**
     * TÃ¬m users thuá»™c role group
     */
    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.roleGroup = :roleGroup")
    List<User> findByRoleGroup(@Param("roleGroup") RoleGroup roleGroup);
    
    /**
     * TÃ¬m users INTERNAL (Admin, Employee)
     */
    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.roleGroup = 'INTERNAL'")
    List<User> findInternalUsers();
    
    /**
     * TÃ¬m users EXTERNAL (Customer)
     */
    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.roleGroup = 'EXTERNAL'")
    List<User> findExternalUsers();
    
    /**
     * Kiá»ƒm tra user cÃ³ role cá»¥ thá»ƒ khÃ´ng
     */
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM User u JOIN u.roles r WHERE u.id = :userId AND r.name = :roleName")
    boolean hasRole(@Param("userId") Long userId, @Param("roleName") String roleName);
    
    // ==================== Date Range Queries ====================
    
    /**
     * TÃ¬m users táº¡o trong khoáº£ng thá»i gian
     */
    List<User> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * TÃ¬m users Ä‘Äƒng nháº­p gáº§n Ä‘Ã¢y
     */
    List<User> findByLastLoginAfter(LocalDateTime date);
    
    /**
     * TÃ¬m users chÆ°a Ä‘Äƒng nháº­p tá»« lÃ¢u
     */
    @Query("SELECT u FROM User u WHERE u.lastLogin IS NULL OR u.lastLogin < :date")
    List<User> findInactiveUsersSince(@Param("date") LocalDateTime date);
    
    // ==================== Search Queries ====================
    
    /**
     * TÃ¬m kiáº¿m users theo username hoáº·c email (LIKE)
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> searchByUsernameOrEmail(@Param("keyword") String keyword);
    
    /**
     * TÃ¬m kiáº¿m users theo há» tÃªn
     */
    List<User> findByFullNameContainingIgnoreCase(String fullName);
    
    /**
     * TÃ¬m users theo sá»‘ Ä‘iá»‡n thoáº¡i
     */
    Optional<User> findByPhone(String phone);
    
    // ==================== Complex Queries ====================
    
    /**
     * Láº¥y users vá»›i Customer information (cÃ³ relationship)
     */
    @Query("SELECT u FROM User u WHERE u.customer IS NOT NULL")
    List<User> findUsersWithCustomerInfo();
    
    /**
     * Láº¥y users vá»›i Employee information (cÃ³ relationship)
     */
    @Query("SELECT u FROM User u WHERE u.employee IS NOT NULL")
    List<User> findUsersWithEmployeeInfo();
    
    /**
     * Äáº¿m sá»‘ users theo role group
     */
    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r.roleGroup = :roleGroup")
    Long countByRoleGroup(@Param("roleGroup") RoleGroup roleGroup);
    
    /**
     * Láº¥y users má»›i nháº¥t (top N)
     */
    List<User> findTop10ByOrderByCreatedAtDesc();
    
    /**
     * Láº¥y users active vÃ  cÃ³ role cá»¥ thá»ƒ
     */
    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE u.isActive = true AND r.name = :roleName")
    List<User> findActiveUsersByRole(@Param("roleName") String roleName);
    
    // ==================== Statistics Queries ====================
    
    /**
     * Äáº¿m tá»•ng sá»‘ users
     */
    @Query("SELECT COUNT(u) FROM User u")
    Long countTotalUsers();
    
    /**
     * Äáº¿m users active
     */
    Long countByIsActiveTrue();
    
    /**
     * Äáº¿m users inactive
     */
    Long countByIsActiveFalse();
    
    /**
     * Äáº¿m users táº¡o trong thÃ¡ng hiá»‡n táº¡i
     */
    @Query("SELECT COUNT(u) FROM User u WHERE YEAR(u.createdAt) = YEAR(CURRENT_DATE) AND MONTH(u.createdAt) = MONTH(CURRENT_DATE)")
    Long countUsersCreatedThisMonth();
}



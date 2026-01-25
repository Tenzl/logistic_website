package com.example.seatrans.features.auth.repository;

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
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByOauthProviderAndOauthProviderId(String oauthProvider, String oauthProviderId);

    List<User> findByIsActiveTrue();

    @Query("SELECT u FROM User u WHERE u.role.name = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);

    @Query("SELECT u FROM User u WHERE u.role.roleGroup = :roleGroup")
    List<User> findByRoleGroup(@Param("roleGroup") RoleGroup roleGroup);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.id = :userId AND u.role.name = :roleName")
    boolean hasRole(@Param("userId") Long userId, @Param("roleName") String roleName);

    @Query("SELECT u FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> searchByEmailOrFullName(@Param("keyword") String keyword);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role.roleGroup = :roleGroup")
    Long countByRoleGroup(@Param("roleGroup") RoleGroup roleGroup);

    Long countByIsActiveTrue();
}
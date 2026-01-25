package com.example.seatrans.features.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.auth.model.Role;

/**
 * Repository interface cho Role entity
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Tìm role theo tên
     * VD: "ROLE_ADMIN", "ROLE_EMPLOYEE", "ROLE_CUSTOMER", "ROLE_GUEST"
     */
    Optional<Role> findByName(String name);
}
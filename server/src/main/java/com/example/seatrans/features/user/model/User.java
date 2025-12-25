package com.example.seatrans.features.user.model;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.seatrans.features.user._customer.model.Customer;
import com.example.seatrans.features.user.model.enums.RoleGroup;
import com.example.seatrans.shared.model.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(unique = true, nullable = true, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String company;

    @Column(length = 100)
    private String nation;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Customer customer;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Employee employee;

    // Helper methods
    public void addRole(Role role) {
        this.roles.add(role);
        role.getUsers().add(this);
    }

    public void removeRole(Role role) {
        this.roles.remove(role);
        role.getUsers().remove(this);
    }

    public boolean hasRole(String roleName) {
        return roles.stream()
                .anyMatch(role -> role.getName().equals(roleName));
    }

    public boolean hasAnyRole(String... roleNames) {
        return roles.stream()
                .anyMatch(role -> Arrays.asList(roleNames).contains(role.getName()));
    }

    public Set<String> getRoleNames() {
        return roles.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }

    public RoleGroup getRoleGroup() {
        return roles.stream()
                .map(Role::getRoleGroup)
                .findFirst()
                .orElse(null);
    }

    public boolean isInternal() {
        return getRoleGroup() == RoleGroup.INTERNAL;
    }

    public boolean isExternal() {
        return getRoleGroup() == RoleGroup.EXTERNAL;
    }
}

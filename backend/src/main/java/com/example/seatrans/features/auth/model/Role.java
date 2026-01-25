package com.example.seatrans.features.auth.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.example.seatrans.features.auth.model.enums.RoleGroup;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "roles")
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String name;
    
    @Column(length = 255)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role_group", nullable = false, length = 20)
    private RoleGroup roleGroup;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "role")
    @JsonIgnore
    private Set<User> users = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Constructors
    public Role() {}
    
    public Role(String name, String description, RoleGroup roleGroup) {
        this.name = name;
        this.description = description;
        this.roleGroup = roleGroup;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public RoleGroup getRoleGroup() {
        return roleGroup;
    }

    public void setRoleGroup(RoleGroup roleGroup) {
        this.roleGroup = roleGroup;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }
}



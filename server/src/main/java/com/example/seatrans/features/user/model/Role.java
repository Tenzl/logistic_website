package com.example.seatrans.features.user.model;

import java.util.HashSet;
import java.util.Set;

import com.example.seatrans.features.user.model.enums.RoleGroup;
import com.example.seatrans.shared.model.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Role extends BaseEntity {

    @Column(unique = true, nullable = false, length = 50)
    private String name;

    @Column(length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_group", nullable = false, length = 20)
    private RoleGroup roleGroup;

    @ManyToMany(mappedBy = "roles")
    private Set<User> users = new HashSet<>();

    public Role(String name, String description, RoleGroup roleGroup) {
        this.name = name;
        this.description = description;
        this.roleGroup = roleGroup;
    }
}

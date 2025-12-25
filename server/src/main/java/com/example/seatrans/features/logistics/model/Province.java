package com.example.seatrans.features.logistics.model;

import java.util.List;

import com.example.seatrans.shared.model.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "provinces")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Province extends BaseEntity {

    // Override to use manual ID instead of auto-generated
    @Override
    @Id
    public Long getId() {
        return super.getId();
    }

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @OneToMany(mappedBy = "province", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Port> ports;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}

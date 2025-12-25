package com.example.seatrans.features.logistics.model;

import java.util.List;

import com.example.seatrans.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import com.example.seatrans.features.gallery.model.ImageTypeEntity;

@Entity
@Table(name = "service_types")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceTypeEntity extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "display_name", nullable = false, length = 200)
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "serviceType", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    private List<ImageTypeEntity> imageTypes;

    public Boolean getIsActive() {
        return this.isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}

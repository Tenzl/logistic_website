package com.example.seatrans.features.gallery.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cargo_types")
@IdClass(CargoTypeCatalogId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CargoTypeCatalogEntity {

    @Id
    @Column(name = "service_type_type", nullable = false, length = 100)
    private String serviceTypeType;

    @Id
    @Column(nullable = false, length = 100)
    private String code;

    @Column(name = "display_label", nullable = false, length = 120)
    private String displayLabel;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

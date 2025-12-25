package com.example.seatrans.features.inquiry.model;

import java.time.LocalDateTime;

import com.example.seatrans.features.logistics.model.ServiceTypeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "service_form_fields", uniqueConstraints = {
    @UniqueConstraint(name = "uq_service_field_key", columnNames = {"service_type_id", "field_key"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceFormField {

    public enum FieldType {
        text, email, tel, textarea, select, number, date, port
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id", nullable = false)
    private ServiceTypeEntity serviceType;

    @Column(name = "field_key", nullable = false, length = 64)
    private String key;

    @Column(nullable = false, length = 255)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FieldType type;

    @Column(nullable = false)
    @Builder.Default
    private Boolean required = false;

    @Column(length = 255)
    private String placeholder;

    @Column(name = "grid_span", nullable = false)
    @Builder.Default
    private Integer gridSpan = 12;

    @Column(columnDefinition = "TEXT")
    private String options; // JSON array string when type = select

    @Column(nullable = false)
    @Builder.Default
    private Integer position = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false)
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

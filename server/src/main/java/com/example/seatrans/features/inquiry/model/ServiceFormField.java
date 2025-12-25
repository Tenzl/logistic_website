package com.example.seatrans.features.inquiry.model;

import com.example.seatrans.features.logistics.model.ServiceTypeEntity;
import com.example.seatrans.shared.model.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "service_form_fields", uniqueConstraints = {
        @UniqueConstraint(name = "uq_service_field_key", columnNames = { "service_type_id", "field_key" })
})
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceFormField extends BaseEntity {

    public enum FieldType {
        text, email, tel, textarea, select, number, date
    }

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

    @Column(columnDefinition = "TEXT")
    private String meta;
}

package com.example.seatrans.features.booking.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "booking_partners")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "customer_id", nullable = false, unique = true, length = 32)
    private String customerId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "booking_partner_addition_types", joinColumns = @JoinColumn(name = "partner_id"))
    @Column(name = "addition_type", nullable = false, length = 32)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<PartnerAdditionType> additionTypes = new HashSet<>();

    @Column(length = 128)
    private String country;

    @Column(length = 128)
    private String city;

    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(length = 64)
    private String phone;

    @Column(length = 64)
    private String fax;

    @Column(name = "tracking_url", length = 512)
    private String trackingUrl;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "customer_status", length = 32)
    @Enumerated(EnumType.STRING)
    private CustomerStatus customerStatus;

    @Column(name = "customer_type", length = 32)
    @Enumerated(EnumType.STRING)
    private CustomerType customerType;

    @Column(name = "tax_number", length = 128)
    private String taxNumber;

    @Column(name = "created_by", nullable = false, length = 255)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_by", nullable = false, length = 255)
    private String updatedBy;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

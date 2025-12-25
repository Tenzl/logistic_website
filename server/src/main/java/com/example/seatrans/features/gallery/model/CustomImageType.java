// package com.example.seatrans.features.gallery.model;

// import java.time.LocalDateTime;

// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
// import jakarta.persistence.EnumType;
// import jakarta.persistence.Enumerated;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;
// import jakarta.persistence.Index;
// import jakarta.persistence.PrePersist;
// import jakarta.persistence.PreUpdate;
// import jakarta.persistence.Table;
// import lombok.AllArgsConstructor;
// import lombok.Builder;
// import lombok.Data;
// import lombok.NoArgsConstructor;

// /**
// * Custom Image Type Entity
// * Allows admin to create custom image types for each service
// */
// @Entity
// @Table(name = "custom_image_types", indexes = {
// @Index(name = "idx_service_type", columnList = "service_type"),
// @Index(name = "idx_code", columnList = "code"),
// @Index(name = "idx_service_code", columnList = "service_type,code", unique =
// true)
// })
// @Data
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder
// public class CustomImageType {

// @Id
// @GeneratedValue(strategy = GenerationType.IDENTITY)
// private Long id;

// @Enumerated(EnumType.STRING)
// @Column(name = "service_type", nullable = false)
// private ServiceType serviceType;

// @Column(nullable = false, length = 50)
// private String code; // e.g., "GALLERY", "CERTIFICATES", "EQUIPMENT",
// "OPERATIONS", "CUSTOM_1"

// @Column(nullable = false, length = 100)
// private String name; // Display name

// @Column(columnDefinition = "TEXT")
// private String description;

// @Column(name = "display_order", nullable = false)
// private Integer displayOrder;

// @Column(nullable = false)
// @Builder.Default
// private Boolean isActive = true;

// @Column(name = "created_at", nullable = false, updatable = false)
// private LocalDateTime createdAt;

// @Column(name = "updated_at", nullable = false)
// private LocalDateTime updatedAt;

// @PrePersist
// protected void onCreate() {
// this.createdAt = LocalDateTime.now();
// this.updatedAt = LocalDateTime.now();
// if (this.isActive == null) {
// this.isActive = true;
// }
// }

// @PreUpdate
// protected void onUpdate() {
// this.updatedAt = LocalDateTime.now();
// }
// }

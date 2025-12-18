package com.example.seatrans.features.pricing.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rate_tables")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RateTable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "service_type", nullable = false, length = 50)
    private String serviceType;
    
    @Column(name = "rate_category", nullable = false, length = 100)
    private String rateCategory;
    
    @Column(name = "rate_name", nullable = false, length = 200)
    private String rateName;
    
    @Column(name = "from_location", length = 200)
    private String fromLocation;
    
    @Column(name = "to_location", length = 200)
    private String toLocation;
    
    @Column(name = "base_rate", nullable = false, precision = 12, scale = 2)
    private BigDecimal baseRate;
    
    @Builder.Default
    @Column(name = "currency", length = 3)
    private String currency = "USD";
    
    @Column(name = "unit", length = 50)
    private String unit;
    
    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;
    
    @Column(name = "valid_to")
    private LocalDate validTo;
    
    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

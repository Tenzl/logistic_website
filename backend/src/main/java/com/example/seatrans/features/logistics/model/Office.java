package com.example.seatrans.features.logistics.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.seatrans.features.provinces.model.Province;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "offices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Office {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "province_id", nullable = false)
    private Province province;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;
    
    @Column(nullable = true, precision = 10, scale = 8)
    private BigDecimal latitude;
    
    @Column(nullable = true, precision = 11, scale = 8)
    private BigDecimal longitude;
    
    @Column(name = "manager_name")
    private String managerName;
    
    @Column(name = "manager_title")
    private String managerTitle;
    
    @Column(name = "manager_mobile", length = 50)
    private String managerMobile;
    
    @Column(name = "manager_email")
    private String managerEmail;
    
    @Column(name = "is_headquarter", nullable = false)
    @Builder.Default
    private Boolean isHeadquarter = false;
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

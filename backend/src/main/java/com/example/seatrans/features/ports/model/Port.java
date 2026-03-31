package com.example.seatrans.features.ports.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.seatrans.features.provinces.model.Province;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
@Table(name = "ports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Port {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "port_of_call", nullable = false, length = 100)
    private String portOfCall;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_id")
    private Province province;

    @Column(name = "zone_code", length = 50)
    private String zoneCode;

    @Column(name = "longitude", precision = 15, scale = 8)
    private BigDecimal longitude;

    @Column(name = "latitude", precision = 15, scale = 8)
    private BigDecimal latitude;

    @Column(name = "country_code", length = 10)
    private String countryCode;

    @Column(name = "code", length = 50)
    private String code;
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "has_info", nullable = false)
    @Builder.Default
    private Integer hasInfo = 0;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Boolean getIsActive() {
        return this.isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Integer getHasInfo() {
        return this.hasInfo;
    }

    public void setHasInfo(Integer hasInfo) {
        this.hasInfo = hasInfo;
    }
    
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

package com.example.seatrans.features.pricing.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "saved_estimates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedEstimate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "estimate_code", unique = true, nullable = false, length = 50)
    private String estimateCode;
    
    @Column(name = "service_type", nullable = false, length = 50)
    private String serviceType;
    
    @Column(name = "session_id", length = 100)
    private String sessionId;
    
    @Column(name = "email", length = 255)
    private String email;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "service_input_data", nullable = false, columnDefinition = "json")
    private String serviceInputData;
    
    @Column(name = "estimated_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal estimatedPrice;
    
    @Builder.Default
    @Column(name = "currency", length = 3)
    private String currency = "USD";
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "converted_to_request_id")
    private Long convertedToRequestId;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

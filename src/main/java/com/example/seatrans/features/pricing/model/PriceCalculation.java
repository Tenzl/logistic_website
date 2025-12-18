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
@Table(name = "price_calculations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceCalculation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "quotation_id", nullable = false)
    private Long quotationId;
    
    @Column(name = "calculation_step", nullable = false, length = 100)
    private String calculationStep;
    
    @Column(name = "component_name", nullable = false, length = 200)
    private String componentName;
    
    @Column(name = "formula_used", columnDefinition = "TEXT")
    private String formulaUsed;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "input_values", columnDefinition = "json")
    private String inputValues;
    
    @Column(name = "base_value", precision = 12, scale = 2)
    private BigDecimal baseValue;
    
    @Column(name = "rate_applied", precision = 10, scale = 4)
    private BigDecimal rateApplied;
    
    @Column(name = "multiplier", precision = 10, scale = 4)
    private BigDecimal multiplier;
    
    @Column(name = "calculated_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal calculatedValue;
    
    @Builder.Default
    @Column(name = "currency", length = 3)
    private String currency = "USD";
    
    @Column(name = "calculation_notes", columnDefinition = "TEXT")
    private String calculationNotes;
    
    @Builder.Default
    @Column(name = "step_order")
    private Integer stepOrder = 0;
    
    @Column(name = "calculated_at", updatable = false)
    private LocalDateTime calculatedAt;
    
    @PrePersist
    protected void onCreate() {
        calculatedAt = LocalDateTime.now();
    }
}

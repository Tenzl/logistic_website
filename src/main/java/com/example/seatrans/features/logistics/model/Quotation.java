package com.example.seatrans.features.logistics.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "quotations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quotation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "quote_code", unique = true, nullable = false, length = 50)
    private String quoteCode;
    
    @Column(name = "request_id")
    private Long requestId;
    
    @Column(name = "customer_id", nullable = false)
    private Long customerId;
    
    @Column(name = "employee_id")
    private Long employeeId;
    
    @Column(name = "service_type", nullable = false, length = 50)
    private String serviceType;
    
    @Builder.Default
    @Column(name = "quote_status", length = 20)
    private String quoteStatus = "DRAFT";
    
    @Column(name = "base_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice;
    
    @Builder.Default
    @Column(name = "total_surcharges", precision = 12, scale = 2)
    private BigDecimal totalSurcharges = BigDecimal.ZERO;
    
    @Builder.Default
    @Column(name = "total_discounts", precision = 12, scale = 2)
    private BigDecimal totalDiscounts = BigDecimal.ZERO;
    
    @Column(name = "subtotal", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;
    
    @Builder.Default
    @Column(name = "tax_amount", precision = 12, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;
    
    @Column(name = "final_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal finalAmount;
    
    @Builder.Default
    @Column(name = "currency", length = 3)
    private String currency = "USD";
    
    @Builder.Default
    @Column(name = "is_price_overridden")
    private Boolean isPriceOverridden = false;
    
    @Column(name = "override_reason", columnDefinition = "TEXT")
    private String overrideReason;
    
    @Column(name = "original_calculated_price", precision = 12, scale = 2)
    private BigDecimal originalCalculatedPrice;
    
    @Column(name = "quote_date", nullable = false)
    private LocalDate quoteDate;
    
    @Column(name = "valid_until", nullable = false)
    private LocalDate validUntil;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "service_input_data", nullable = false, columnDefinition = "json")
    private String serviceInputData;
    
    @Column(name = "customer_response", length = 20)
    private String customerResponse;
    
    @Column(name = "customer_response_date")
    private LocalDateTime customerResponseDate;
    
    @Column(name = "customer_notes", columnDefinition = "TEXT")
    private String customerNotes;
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
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

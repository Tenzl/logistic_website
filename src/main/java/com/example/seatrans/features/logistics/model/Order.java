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
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_code", unique = true, nullable = false, length = 50)
    private String orderCode;
    
    @Column(name = "quotation_id", nullable = false)
    private Long quotationId;
    
    @Column(name = "customer_id", nullable = false)
    private Long customerId;
    
    @Column(name = "employee_id")
    private Long employeeId;
    
    @Column(name = "service_type", nullable = false, length = 50)
    private String serviceType;
    
    @Builder.Default
    @Column(name = "order_status", length = 20)
    private String orderStatus = "PENDING";
    
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
    @Column(name = "payment_status", length = 20)
    private String paymentStatus = "UNPAID";
    
    @Builder.Default
    @Column(name = "paid_amount", precision = 12, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;
    
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "service_data", nullable = false, columnDefinition = "json")
    private String serviceData;
    
    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;
    
    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    
    @Column(name = "customer_notes", columnDefinition = "TEXT")
    private String customerNotes;
    
    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;
    
    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;
    
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

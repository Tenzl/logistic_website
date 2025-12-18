package com.example.seatrans.features.pricing.model;

import com.example.seatrans.features.logistics.model.ServiceType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity quản lý cấu hình phí động
 * Admin có thể CRUD, thay đổi công thức, sắp xếp thứ tự hiển thị
 */
@Entity
@Table(name = "fee_configurations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Tên phí hiển thị (VD: "Tonnage Fee", "Pilotage Fee")
     */
    @Column(nullable = false, length = 200)
    private String feeName;

    /**
     * Mã phí (unique identifier)
     */
    @Column(nullable = false, unique = true, length = 50)
    private String feeCode;

    /**
     * Loại dịch vụ áp dụng
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ServiceType serviceType;

    /**
     * Loại công thức tính
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private FeeFormulaType formulaType;

    /**
     * Công thức tính (dạng JSON hoặc expression)
     * VD: {"base": 400, "grtRate": 0.15, "multiply": "GRT"}
     * Hoặc: "GRT * 0.025 * days"
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String formula;

    /**
     * Mô tả công thức (cho admin hiểu)
     */
    @Column(columnDefinition = "TEXT")
    private String formulaDescription;

    /**
     * Thứ tự hiển thị trong danh sách phí
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    /**
     * Trạng thái phí (ACTIVE/INACTIVE)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private FeeStatus status = FeeStatus.ACTIVE;

    /**
     * Cổng áp dụng (null = tất cả cổng)
     */
    @Column(length = 100)
    private String applicablePort;

    /**
     * Điều kiện áp dụng (optional, dạng JSON)
     * VD: {"minDWT": 10000, "maxDWT": 50000}
     */
    @Column(columnDefinition = "TEXT")
    private String conditions;

    /**
     * Ghi chú cho admin
     */
    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

package com.example.seatrans.features.pricing.repository;

import com.example.seatrans.features.pricing.model.FeeConfiguration;
import com.example.seatrans.features.pricing.model.FeeStatus;
import com.example.seatrans.features.logistics.model.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeeConfigurationRepository extends JpaRepository<FeeConfiguration, Long> {

    /**
     * Lấy tất cả fee configurations theo service type, sắp xếp theo displayOrder
     */
    List<FeeConfiguration> findByServiceTypeOrderByDisplayOrderAsc(ServiceType serviceType);

    /**
     * Lấy fee configurations ACTIVE theo service type
     */
    List<FeeConfiguration> findByServiceTypeAndStatusOrderByDisplayOrderAsc(
            ServiceType serviceType, 
            FeeStatus status
    );

    /**
     * Lấy fee configurations theo service type và port cụ thể
     * Port = null hoặc = applicablePort
     */
    @Query("SELECT f FROM FeeConfiguration f WHERE f.serviceType = :serviceType " +
           "AND f.status = :status " +
           "AND (f.applicablePort IS NULL OR f.applicablePort = :port) " +
           "ORDER BY f.displayOrder ASC")
    List<FeeConfiguration> findByServiceTypeAndPort(
            ServiceType serviceType, 
            FeeStatus status,
            String port
    );

    /**
     * Kiểm tra feeCode đã tồn tại chưa
     */
    boolean existsByFeeCode(String feeCode);

    /**
     * Tìm theo feeCode
     */
    Optional<FeeConfiguration> findByFeeCode(String feeCode);

    /**
     * Lấy displayOrder cao nhất của service type
     */
    @Query("SELECT COALESCE(MAX(f.displayOrder), 0) FROM FeeConfiguration f WHERE f.serviceType = :serviceType")
    Integer getMaxDisplayOrder(ServiceType serviceType);

    /**
     * Đếm số fee configurations theo service type
     */
    long countByServiceType(ServiceType serviceType);

    /**
     * Xóa tất cả fee configurations theo service type (dùng cho test)
     */
    void deleteByServiceType(ServiceType serviceType);
}

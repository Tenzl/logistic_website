package com.example.seatrans.features.logistics.repository;

import com.example.seatrans.features.logistics.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByOrderCode(String orderCode);
    
    Optional<Order> findByQuotationId(Long quotationId);
    
    List<Order> findByCustomerId(Long customerId);
    
    List<Order> findByCustomerIdAndOrderStatus(Long customerId, String orderStatus);
    
    List<Order> findByEmployeeId(Long employeeId);
    
    List<Order> findByOrderStatus(String orderStatus);
    
    List<Order> findByPaymentStatus(String paymentStatus);
    
    @Query("SELECT o FROM Order o WHERE o.customerId = :customerId ORDER BY o.orderDate DESC")
    List<Order> findByCustomerIdOrderByOrderDateDesc(@Param("customerId") Long customerId);
    
    @Query("SELECT o FROM Order o WHERE o.employeeId = :employeeId AND o.orderStatus IN :statuses ORDER BY o.orderDate DESC")
    List<Order> findByEmployeeIdAndOrderStatusIn(
        @Param("employeeId") Long employeeId, 
        @Param("statuses") List<String> statuses
    );
    
    Long countByOrderStatus(String orderStatus);
    
    Long countByPaymentStatus(String paymentStatus);
}

package com.example.seatrans.features.logistics.service;

import com.example.seatrans.features.logistics.dto.OrderDTO;
import com.example.seatrans.features.logistics.model.*;
import com.example.seatrans.features.logistics.model.*;
import com.example.seatrans.shared.exception.UserNotFoundException;
import com.example.seatrans.features.logistics.repository.*;
import com.example.seatrans.features.logistics.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final QuotationRepository quotationRepository;
    private final QuotationItemRepository quotationItemRepository;
    
    private static final DateTimeFormatter CODE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    
    /**
     * Create order from accepted quotation
     */
    @Transactional
    public OrderDTO createOrderFromQuotation(Long quotationId) {
        log.info("Creating order from quotation: {}", quotationId);
        
        Quotation quotation = quotationRepository.findById(quotationId)
            .orElseThrow(() -> new UserNotFoundException("Quotation not found"));
        
        if (!"ACCEPTED".equals(quotation.getQuoteStatus())) {
            throw new IllegalStateException("Quotation must be accepted before creating order");
        }
        
        // Check if order already exists
        if (orderRepository.findByQuotationId(quotationId).isPresent()) {
            throw new IllegalStateException("Order already exists for this quotation");
        }
        
        // Create order
        Order order = Order.builder()
            .orderCode(generateOrderCode())
            .quotationId(quotationId)
            .customerId(quotation.getCustomerId())
            .employeeId(quotation.getEmployeeId())
            .serviceType(quotation.getServiceType())
            .orderStatus("PENDING")
            .paymentStatus("UNPAID")
            .basePrice(quotation.getBasePrice())
            .totalSurcharges(quotation.getTotalSurcharges())
            .totalDiscounts(quotation.getTotalDiscounts())
            .subtotal(quotation.getSubtotal())
            .taxAmount(quotation.getTaxAmount())
            .finalAmount(quotation.getFinalAmount())
            .currency(quotation.getCurrency())
            .paidAmount(BigDecimal.ZERO)
            .serviceData(quotation.getServiceInputData())
            .orderDate(LocalDate.now())
            .customerNotes(quotation.getCustomerNotes())
            .build();
        
        orderRepository.save(order);
        
        // Copy quotation items to order items
        List<QuotationItem> quotationItems = quotationItemRepository.findByQuotationId(quotationId);
        for (QuotationItem qItem : quotationItems) {
            OrderItem orderItem = OrderItem.builder()
                .orderId(order.getId())
                .itemCategory(qItem.getItemCategory())
                .itemName(qItem.getItemName())
                .description(qItem.getDescription())
                .quantity(qItem.getQuantity())
                .unitPrice(qItem.getUnitPrice())
                .totalPrice(qItem.getTotalPrice())
                .build();
            orderItemRepository.save(orderItem);
        }
        
        log.info("Order created: {}", order.getOrderCode());
        
        return mapToDTO(order);
    }
    
    /**
     * Get customer order (FINAL AMOUNT ONLY - NO BREAKDOWN)
     */
    public OrderDTO getCustomerOrder(Long id, Long customerId) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("Order not found"));
        
        if (!order.getCustomerId().equals(customerId)) {
            throw new SecurityException("Access denied");
        }
        
        return mapToDTO(order);
    }
    
    public List<OrderDTO> getCustomerOrders(Long customerId) {
        return orderRepository.findByCustomerIdOrderByOrderDateDesc(customerId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("Order not found"));
        
        order.setOrderStatus(status);
        
        if ("CONFIRMED".equals(status)) {
            order.setConfirmedAt(LocalDateTime.now());
        } else if ("COMPLETED".equals(status)) {
            order.setCompletedAt(LocalDateTime.now());
        } else if ("CANCELLED".equals(status)) {
            order.setCancelledAt(LocalDateTime.now());
        }
        
        orderRepository.save(order);
        log.info("Order {} status updated to {}", order.getOrderCode(), status);
    }
    
    @Transactional
    public void updatePaymentStatus(Long id, String paymentStatus, BigDecimal paidAmount) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("Order not found"));
        
        order.setPaymentStatus(paymentStatus);
        order.setPaidAmount(paidAmount);
        
        orderRepository.save(order);
        log.info("Order {} payment updated: {} - {}", order.getOrderCode(), paymentStatus, paidAmount);
    }
    
    private String generateOrderCode() {
        String dateCode = LocalDateTime.now().format(CODE_FORMATTER);
        long count = orderRepository.count() + 1;
        return String.format("ORD-%s-%04d", dateCode, count);
    }
    
    /**
     * Map to customer DTO - FINAL AMOUNT ONLY (NO BREAKDOWN)
     */
    private OrderDTO mapToDTO(Order entity) {
        BigDecimal outstanding = entity.getFinalAmount().subtract(entity.getPaidAmount());
        
        return OrderDTO.builder()
            .id(entity.getId())
            .orderCode(entity.getOrderCode())
            .quotationId(entity.getQuotationId())
            .customerId(entity.getCustomerId())
            .serviceType(entity.getServiceType())
            .orderStatus(entity.getOrderStatus())
            .paymentStatus(entity.getPaymentStatus())
            // ONLY final amounts - NO BREAKDOWN
            .finalAmount(entity.getFinalAmount())
            .paidAmount(entity.getPaidAmount())
            .outstandingAmount(outstanding)
            .currency(entity.getCurrency())
            .orderDate(entity.getOrderDate().toString())
            .confirmedAt(entity.getConfirmedAt() != null ? entity.getConfirmedAt().toString() : null)
            .completedAt(entity.getCompletedAt() != null ? entity.getCompletedAt().toString() : null)
            .customerNotes(entity.getCustomerNotes())
            .invoiceUrl("/api/orders/" + entity.getId() + "/invoice")
            .canPay("UNPAID".equals(entity.getPaymentStatus()) || "PARTIAL".equals(entity.getPaymentStatus()))
            .canCancel("PENDING".equals(entity.getOrderStatus()))
            .build();
    }
}

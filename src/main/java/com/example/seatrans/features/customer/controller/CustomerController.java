package com.example.seatrans.features.customer.controller;

import com.example.seatrans.shared.dto.ApiResponse;
import com.example.seatrans.features.customer.dto.CustomerDTO;
import com.example.seatrans.features.customer.model.Customer;
import com.example.seatrans.features.customer.model.enums.CustomerType;
import com.example.seatrans.features.customer.model.enums.MembershipLevel;
import com.example.seatrans.shared.mapper.EntityMapper;
import com.example.seatrans.features.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller xÃ¡Â»Â­ lÃƒÂ½ Customer management
 */
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Validated
public class CustomerController {
    
    private final CustomerService customerService;
    private final EntityMapper entityMapper;
    
    // ==================== Create Operations ====================
    
    /**
     * POST /api/customers
     * TÃ¡ÂºÂ¡o customer mÃ¡Â»â€ºi
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CustomerDTO>> createCustomer(@Valid @RequestBody CustomerDTO customerDTO) {
        Customer customer = entityMapper.toCustomerEntity(customerDTO);
        Customer createdCustomer = customerService.createCustomer(customer);
        CustomerDTO responseDTO = entityMapper.toCustomerDTO(createdCustomer);
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer created successfully", responseDTO));
    }
    
    /**
     * POST /api/customers/user/{userId}
     * TÃ¡ÂºÂ¡o customer cho user Ã„â€˜ÃƒÂ£ tÃ¡Â»â€œn tÃ¡ÂºÂ¡i
     */
    @PostMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<CustomerDTO>> createCustomerForUser(
            @PathVariable Long userId,
            @Valid @RequestBody CustomerDTO customerDTO) {
        
        Customer customer = entityMapper.toCustomerEntity(customerDTO);
        Customer createdCustomer = customerService.createCustomerForUser(userId, customer);
        CustomerDTO responseDTO = entityMapper.toCustomerDTO(createdCustomer);
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer created for user", responseDTO));
    }
    
    // ==================== Read Operations ====================
    
    /**
     * GET /api/customers
     * LÃ¡ÂºÂ¥y tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ customers
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerDTO>>> getAllCustomers() {
        List<Customer> customers = customerService.getAllCustomers();
        List<CustomerDTO> customerDTOs = customers.stream()
                .map(entityMapper::toCustomerDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(customerDTOs));
    }
    
    /**
     * GET /api/customers/{id}
     * LÃ¡ÂºÂ¥y customer theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDTO>> getCustomerById(@PathVariable Long id) {
        Customer customer = customerService.getCustomerById(id);
        CustomerDTO customerDTO = entityMapper.toCustomerDTO(customer);
        
        return ResponseEntity.ok(ApiResponse.success(customerDTO));
    }
    
    /**
     * GET /api/customers/user/{userId}
     * LÃ¡ÂºÂ¥y customer theo user ID
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<CustomerDTO>> getCustomerByUserId(@PathVariable Long userId) {
        Customer customer = customerService.getCustomerByUserId(userId);
        CustomerDTO customerDTO = entityMapper.toCustomerDTO(customer);
        
        return ResponseEntity.ok(ApiResponse.success(customerDTO));
    }
    
    /**
     * GET /api/customers/code/{customerCode}
     * LÃ¡ÂºÂ¥y customer theo customer code
     */
    @GetMapping("/code/{customerCode}")
    public ResponseEntity<ApiResponse<CustomerDTO>> getCustomerByCode(@PathVariable String customerCode) {
        Customer customer = customerService.getCustomerByCode(customerCode);
        CustomerDTO customerDTO = entityMapper.toCustomerDTO(customer);
        
        return ResponseEntity.ok(ApiResponse.success(customerDTO));
    }
    
    /**
     * GET /api/customers/active
     * LÃ¡ÂºÂ¥y active customers
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<CustomerDTO>>> getActiveCustomers() {
        List<Customer> customers = customerService.getActiveCustomers();
        List<CustomerDTO> customerDTOs = customers.stream()
                .map(entityMapper::toCustomerDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(customerDTOs));
    }
    
    /**
     * GET /api/customers/type/{customerType}
     * LÃ¡ÂºÂ¥y customers theo type
     */
    @GetMapping("/type/{customerType}")
    public ResponseEntity<ApiResponse<List<CustomerDTO>>> getCustomersByType(@PathVariable CustomerType customerType) {
        List<Customer> customers = customerService.getCustomersByType(customerType);
        List<CustomerDTO> customerDTOs = customers.stream()
                .map(entityMapper::toCustomerDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(customerDTOs));
    }
    
    /**
     * GET /api/customers/membership/{level}
     * LÃ¡ÂºÂ¥y customers theo membership level
     */
    @GetMapping("/membership/{level}")
    public ResponseEntity<ApiResponse<List<CustomerDTO>>> getCustomersByMembershipLevel(@PathVariable MembershipLevel level) {
        List<Customer> customers = customerService.getCustomersByMembershipLevel(level);
        List<CustomerDTO> customerDTOs = customers.stream()
                .map(entityMapper::toCustomerDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(customerDTOs));
    }
    
    /**
     * GET /api/customers/vip
     * LÃ¡ÂºÂ¥y VIP customers (Gold + Platinum)
     */
    @GetMapping("/vip")
    public ResponseEntity<ApiResponse<List<CustomerDTO>>> getVipCustomers() {
        List<Customer> customers = customerService.getVipCustomers();
        List<CustomerDTO> customerDTOs = customers.stream()
                .map(entityMapper::toCustomerDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(customerDTOs));
    }
    
    /**
     * GET /api/customers/search?keyword={keyword}
     * TÃƒÂ¬m kiÃ¡ÂºÂ¿m customers
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CustomerDTO>>> searchCustomers(@RequestParam String keyword) {
        List<Customer> customers = customerService.searchCustomers(keyword);
        List<CustomerDTO> customerDTOs = customers.stream()
                .map(entityMapper::toCustomerDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(customerDTOs));
    }
    
    // ==================== Update Operations ====================
    
    /**
     * PUT /api/customers/{id}
     * CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t customer info
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDTO>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerDTO customerDTO) {
        
        Customer updatedCustomer = entityMapper.toCustomerEntity(customerDTO);
        Customer customer = customerService.updateCustomer(id, updatedCustomer);
        CustomerDTO responseDTO = entityMapper.toCustomerDTO(customer);
        
        return ResponseEntity.ok(ApiResponse.success("Customer updated successfully", responseDTO));
    }
    
    // ==================== Loyalty Points Management ====================
    
    /**
     * POST /api/customers/{id}/loyalty-points/add
     * ThÃƒÂªm loyalty points
     */
    @PostMapping("/{id}/loyalty-points/add")
    public ResponseEntity<ApiResponse<CustomerDTO>> addLoyaltyPoints(
            @PathVariable Long id,
            @RequestParam int points) {
        
        Customer customer = customerService.addLoyaltyPoints(id, points);
        CustomerDTO customerDTO = entityMapper.toCustomerDTO(customer);
        
        return ResponseEntity.ok(ApiResponse.success("Loyalty points added", customerDTO));
    }
    
    /**
     * POST /api/customers/{id}/loyalty-points/deduct
     * TrÃ¡Â»Â« loyalty points
     */
    @PostMapping("/{id}/loyalty-points/deduct")
    public ResponseEntity<ApiResponse<CustomerDTO>> deductLoyaltyPoints(
            @PathVariable Long id,
            @RequestParam int points) {
        
        Customer customer = customerService.deductLoyaltyPoints(id, points);
        CustomerDTO customerDTO = entityMapper.toCustomerDTO(customer);
        
        return ResponseEntity.ok(ApiResponse.success("Loyalty points deducted", customerDTO));
    }
    
    /**
     * PUT /api/customers/{id}/membership/update
     * CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t membership level
     */
    @PutMapping("/{id}/membership/update")
    public ResponseEntity<ApiResponse<CustomerDTO>> updateMembershipLevel(@PathVariable Long id) {
        Customer customer = customerService.updateMembershipLevel(id);
        CustomerDTO customerDTO = entityMapper.toCustomerDTO(customer);
        
        return ResponseEntity.ok(ApiResponse.success("Membership level updated", customerDTO));
    }
    
    // ==================== Credit Management ====================
    
    /**
     * PUT /api/customers/{id}/credit-limit
     * Set credit limit
     */
    @PutMapping("/{id}/credit-limit")
    public ResponseEntity<ApiResponse<CustomerDTO>> setCreditLimit(
            @PathVariable Long id,
            @RequestParam BigDecimal creditLimit) {
        
        Customer customer = customerService.setCreditLimit(id, creditLimit);
        CustomerDTO customerDTO = entityMapper.toCustomerDTO(customer);
        
        return ResponseEntity.ok(ApiResponse.success("Credit limit updated", customerDTO));
    }
    
    /**
     * POST /api/customers/{id}/credit-limit/increase
     * Increase credit limit
     */
    @PostMapping("/{id}/credit-limit/increase")
    public ResponseEntity<ApiResponse<CustomerDTO>> increaseCreditLimit(
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {
        
        Customer customer = customerService.increaseCreditLimit(id, amount);
        CustomerDTO customerDTO = entityMapper.toCustomerDTO(customer);
        
        return ResponseEntity.ok(ApiResponse.success("Credit limit increased", customerDTO));
    }
    
    /**
     * POST /api/customers/{id}/credit-limit/decrease
     * Decrease credit limit
     */
    @PostMapping("/{id}/credit-limit/decrease")
    public ResponseEntity<ApiResponse<CustomerDTO>> decreaseCreditLimit(
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {
        
        Customer customer = customerService.decreaseCreditLimit(id, amount);
        CustomerDTO customerDTO = entityMapper.toCustomerDTO(customer);
        
        return ResponseEntity.ok(ApiResponse.success("Credit limit decreased", customerDTO));
    }
    
    /**
     * GET /api/customers/{id}/can-purchase
     * KiÃ¡Â»Æ’m tra cÃƒÂ³ thÃ¡Â»Æ’ mua vÃ¡Â»â€ºi sÃ¡Â»â€˜ tiÃ¡Â»Ân nÃƒÂ y khÃƒÂ´ng
     */
    @GetMapping("/{id}/can-purchase")
    public ResponseEntity<ApiResponse<Boolean>> canPurchase(
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {
        
        boolean canPurchase = customerService.canPurchase(id, amount);
        
        return ResponseEntity.ok(ApiResponse.success(canPurchase));
    }
    
    // ==================== Delete Operations ====================
    
    /**
     * DELETE /api/customers/{id}
     * XÃƒÂ³a customer
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        
        return ResponseEntity.ok(ApiResponse.success("Customer deleted successfully", null));
    }
    
    // ==================== Statistics ====================
    
    /**
     * GET /api/customers/stats/count
     * Ã„ÂÃ¡ÂºÂ¿m tÃ¡Â»â€¢ng customers
     */
    @GetMapping("/stats/count")
    public ResponseEntity<ApiResponse<Long>> countTotalCustomers() {
        Long count = customerService.countTotalCustomers();
        
        return ResponseEntity.ok(ApiResponse.success(count));
    }
    
    /**
     * GET /api/customers/stats/active-count
     * Ã„ÂÃ¡ÂºÂ¿m active customers
     */
    @GetMapping("/stats/active-count")
    public ResponseEntity<ApiResponse<Long>> countActiveCustomers() {
        Long count = customerService.countActiveCustomers();
        
        return ResponseEntity.ok(ApiResponse.success(count));
    }
    
    /**
     * GET /api/customers/stats/total-loyalty-points
     * TÃ¡Â»â€¢ng loyalty points
     */
    @GetMapping("/stats/total-loyalty-points")
    public ResponseEntity<ApiResponse<Long>> getTotalLoyaltyPoints() {
        Long total = customerService.getTotalLoyaltyPoints();
        
        return ResponseEntity.ok(ApiResponse.success(total));
    }
    
    /**
     * GET /api/customers/stats/average-loyalty-points
     * Trung bÃƒÂ¬nh loyalty points
     */
    @GetMapping("/stats/average-loyalty-points")
    public ResponseEntity<ApiResponse<Double>> getAverageLoyaltyPoints() {
        Double average = customerService.getAverageLoyaltyPoints();
        
        return ResponseEntity.ok(ApiResponse.success(average));
    }
}




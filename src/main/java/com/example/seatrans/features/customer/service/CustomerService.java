package com.example.seatrans.features.customer.service;

import com.example.seatrans.features.customer.model.Customer;
import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.customer.model.enums.CustomerType;
import com.example.seatrans.features.customer.model.enums.MembershipLevel;
import com.example.seatrans.shared.exception.CustomerNotFoundException;
import com.example.seatrans.shared.exception.InvalidCustomerDataException;
import com.example.seatrans.shared.exception.UserNotFoundException;
import com.example.seatrans.features.customer.repository.CustomerRepository;
import com.example.seatrans.features.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service xÃ¡Â»Â­ lÃƒÂ½ business logic cho Customer
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {
    
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    
    // ==================== Create Operations ====================
    
    /**
     * TÃ¡ÂºÂ¡o customer mÃ¡Â»â€ºi
     * 
     * @param customer Customer entity
     * @return Customer Ã„â€˜ÃƒÂ£ lÃ†Â°u
     */
    public Customer createCustomer(Customer customer) {
        // Validate customer data
        validateCustomerData(customer);
        
        // KiÃ¡Â»Æ’m tra user tÃ¡Â»â€œn tÃ¡ÂºÂ¡i
        if (customer.getUser() != null && customer.getUser().getId() != null) {
            User user = userRepository.findById(customer.getUser().getId())
                .orElseThrow(() -> new UserNotFoundException(customer.getUser().getId()));
            customer.setUser(user);
        }
        
        return customerRepository.save(customer);
    }
    
    /**
     * TÃ¡ÂºÂ¡o customer cho user Ã„â€˜ÃƒÂ£ tÃ¡Â»â€œn tÃ¡ÂºÂ¡i
     */
    public Customer createCustomerForUser(Long userId, Customer customer) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));
        
        // KiÃ¡Â»Æ’m tra user Ã„â€˜ÃƒÂ£ cÃƒÂ³ customer chÃ†Â°a
        if (user.getCustomer() != null) {
            throw new InvalidCustomerDataException("User already has customer information");
        }
        
        customer.setUser(user);
        validateCustomerData(customer);
        
        return customerRepository.save(customer);
    }
    
    // ==================== Read Operations ====================
    
    /**
     * LÃ¡ÂºÂ¥y customer theo ID
     */
    @Transactional(readOnly = true)
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
            .orElseThrow(() -> new CustomerNotFoundException(id));
    }
    
    /**
     * LÃ¡ÂºÂ¥y customer theo user ID
     */
    @Transactional(readOnly = true)
    public Customer getCustomerByUserId(Long userId) {
        return customerRepository.findByUserId(userId)
            .orElseThrow(() -> new CustomerNotFoundException("userId", userId.toString()));
    }
    
    /**
     * LÃ¡ÂºÂ¥y customer theo customer code
     */
    @Transactional(readOnly = true)
    public Customer getCustomerByCode(String customerCode) {
        return customerRepository.findByCustomerCode(customerCode)
            .orElseThrow(() -> new CustomerNotFoundException("customerCode", customerCode));
    }
    
    /**
     * LÃ¡ÂºÂ¥y tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ customers
     */
    @Transactional(readOnly = true)
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }
    
    /**
     * LÃ¡ÂºÂ¥y active customers
     */
    @Transactional(readOnly = true)
    public List<Customer> getActiveCustomers() {
        return customerRepository.findActiveCustomers();
    }
    
    /**
     * LÃ¡ÂºÂ¥y customers theo type
     */
    @Transactional(readOnly = true)
    public List<Customer> getCustomersByType(CustomerType customerType) {
        return customerRepository.findByCustomerType(customerType);
    }
    
    /**
     * LÃ¡ÂºÂ¥y customers theo membership level
     */
    @Transactional(readOnly = true)
    public List<Customer> getCustomersByMembershipLevel(MembershipLevel level) {
        return customerRepository.findByMembershipLevel(level);
    }
    
    /**
     * LÃ¡ÂºÂ¥y VIP customers (Gold + Platinum)
     */
    @Transactional(readOnly = true)
    public List<Customer> getVipCustomers() {
        return customerRepository.findVipCustomers();
    }
    
    /**
     * TÃƒÂ¬m kiÃ¡ÂºÂ¿m customers
     */
    @Transactional(readOnly = true)
    public List<Customer> searchCustomers(String keyword) {
        return customerRepository.searchCustomers(keyword);
    }
    
    // ==================== Update Operations ====================
    
    /**
     * CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t customer information
     */
    public Customer updateCustomer(Long customerId, Customer updatedCustomer) {
        Customer existingCustomer = getCustomerById(customerId);
        
        // Update fields
        if (updatedCustomer.getCompanyName() != null) {
            existingCustomer.setCompanyName(updatedCustomer.getCompanyName());
        }
        if (updatedCustomer.getTaxCode() != null) {
            existingCustomer.setTaxCode(updatedCustomer.getTaxCode());
        }
        if (updatedCustomer.getCustomerType() != null) {
            existingCustomer.setCustomerType(updatedCustomer.getCustomerType());
        }
        if (updatedCustomer.getAddress() != null) {
            existingCustomer.setAddress(updatedCustomer.getAddress());
        }
        if (updatedCustomer.getCity() != null) {
            existingCustomer.setCity(updatedCustomer.getCity());
        }
        if (updatedCustomer.getCountry() != null) {
            existingCustomer.setCountry(updatedCustomer.getCountry());
        }
        if (updatedCustomer.getPostalCode() != null) {
            existingCustomer.setPostalCode(updatedCustomer.getPostalCode());
        }
        if (updatedCustomer.getCreditLimit() != null) {
            existingCustomer.setCreditLimit(updatedCustomer.getCreditLimit());
        }
        
        // Validate sau khi update
        validateCustomerData(existingCustomer);
        
        return customerRepository.save(existingCustomer);
    }
    
    // ==================== Loyalty Points Management ====================
    
    /**
     * ThÃƒÂªm loyalty points
     */
    public Customer addLoyaltyPoints(Long customerId, int points) {
        if (points <= 0) {
            throw new IllegalArgumentException("Points must be positive");
        }
        
        Customer customer = getCustomerById(customerId);
        customer.addLoyaltyPoints(points);
        
        return customerRepository.save(customer);
    }
    
    /**
     * TrÃ¡Â»Â« loyalty points
     */
    public Customer deductLoyaltyPoints(Long customerId, int points) {
        if (points <= 0) {
            throw new IllegalArgumentException("Points must be positive");
        }
        
        Customer customer = getCustomerById(customerId);
        
        if (customer.getLoyaltyPoints() < points) {
            throw new IllegalArgumentException("Insufficient loyalty points");
        }
        
        customer.deductLoyaltyPoints(points);
        
        return customerRepository.save(customer);
    }
    
    /**
     * CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t membership level dÃ¡Â»Â±a trÃƒÂªn points
     */
    public Customer updateMembershipLevel(Long customerId) {
        Customer customer = getCustomerById(customerId);
        customer.updateMembershipLevel();
        
        return customerRepository.save(customer);
    }
    
    // ==================== Credit Management ====================
    
    /**
     * Set credit limit
     */
    public Customer setCreditLimit(Long customerId, BigDecimal creditLimit) {
        if (creditLimit.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Credit limit cannot be negative");
        }
        
        Customer customer = getCustomerById(customerId);
        customer.setCreditLimit(creditLimit);
        
        return customerRepository.save(customer);
    }
    
    /**
     * Increase credit limit
     */
    public Customer increaseCreditLimit(Long customerId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        
        Customer customer = getCustomerById(customerId);
        customer.setCreditLimit(customer.getCreditLimit().add(amount));
        
        return customerRepository.save(customer);
    }
    
    /**
     * Decrease credit limit
     */
    public Customer decreaseCreditLimit(Long customerId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        
        Customer customer = getCustomerById(customerId);
        BigDecimal newLimit = customer.getCreditLimit().subtract(amount);
        
        if (newLimit.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Credit limit cannot be negative");
        }
        
        customer.setCreditLimit(newLimit);
        
        return customerRepository.save(customer);
    }
    
    /**
     * KiÃ¡Â»Æ’m tra cÃƒÂ³ thÃ¡Â»Æ’ mua vÃ¡Â»â€ºi sÃ¡Â»â€˜ tiÃ¡Â»Ân nÃƒÂ y khÃƒÂ´ng
     */
    @Transactional(readOnly = true)
    public boolean canPurchase(Long customerId, BigDecimal amount) {
        Customer customer = getCustomerById(customerId);
        return customer.canPurchase(amount);
    }
    
    // ==================== Delete Operations ====================
    
    /**
     * XÃƒÂ³a customer
     */
    public void deleteCustomer(Long customerId) {
        Customer customer = getCustomerById(customerId);
        customerRepository.delete(customer);
    }
    
    // ==================== Validation ====================
    
    /**
     * Validate customer data
     */
    private void validateCustomerData(Customer customer) {
        // NÃ¡ÂºÂ¿u lÃƒÂ  COMPANY thÃƒÂ¬ phÃ¡ÂºÂ£i cÃƒÂ³ companyName vÃƒÂ  taxCode
        if (customer.getCustomerType() == CustomerType.COMPANY) {
            if (customer.getCompanyName() == null || customer.getCompanyName().trim().isEmpty()) {
                throw new InvalidCustomerDataException("Company name is required for COMPANY type");
            }
            if (customer.getTaxCode() == null || customer.getTaxCode().trim().isEmpty()) {
                throw new InvalidCustomerDataException("Tax code is required for COMPANY type");
            }
        }
        
        // Loyalty points khÃƒÂ´ng ÃƒÂ¢m
        if (customer.getLoyaltyPoints() != null && customer.getLoyaltyPoints() < 0) {
            throw new InvalidCustomerDataException("Loyalty points cannot be negative");
        }
        
        // Credit limit khÃƒÂ´ng ÃƒÂ¢m
        if (customer.getCreditLimit() != null && customer.getCreditLimit().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidCustomerDataException("Credit limit cannot be negative");
        }
    }
    
    // ==================== Statistics ====================
    
    /**
     * Ã„ÂÃ¡ÂºÂ¿m tÃ¡Â»â€¢ng customers
     */
    @Transactional(readOnly = true)
    public Long countTotalCustomers() {
        return customerRepository.count();
    }
    
    /**
     * Ã„ÂÃ¡ÂºÂ¿m active customers
     */
    @Transactional(readOnly = true)
    public Long countActiveCustomers() {
        return customerRepository.countActiveCustomers();
    }
    
    /**
     * Ã„ÂÃ¡ÂºÂ¿m customers theo type
     */
    @Transactional(readOnly = true)
    public Long countCustomersByType(CustomerType type) {
        return customerRepository.countByCustomerType(type);
    }
    
    /**
     * Ã„ÂÃ¡ÂºÂ¿m customers theo membership level
     */
    @Transactional(readOnly = true)
    public Long countCustomersByMembershipLevel(MembershipLevel level) {
        return customerRepository.countByMembershipLevel(level);
    }
    
    /**
     * TÃƒÂ­nh tÃ¡Â»â€¢ng loyalty points
     */
    @Transactional(readOnly = true)
    public Long getTotalLoyaltyPoints() {
        return customerRepository.getTotalLoyaltyPoints();
    }
    
    /**
     * TÃƒÂ­nh trung bÃƒÂ¬nh loyalty points
     */
    @Transactional(readOnly = true)
    public Double getAverageLoyaltyPoints() {
        return customerRepository.getAverageLoyaltyPoints();
    }
}




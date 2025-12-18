package com.example.seatrans.features.customer.repository;

import com.example.seatrans.features.customer.model.Customer;
import com.example.seatrans.features.customer.model.enums.CustomerType;
import com.example.seatrans.features.customer.model.enums.MembershipLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface cho Customer entity
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    // ==================== Basic Queries ====================
    
    /**
     * TÃƒÂ¬m customer theo user ID
     */
    Optional<Customer> findByUserId(Long userId);
    
    /**
     * TÃƒÂ¬m customer theo customer code
     */
    Optional<Customer> findByCustomerCode(String customerCode);
    
    /**
     * TÃƒÂ¬m customer theo email cÃ¡Â»Â§a user
     */
    @Query("SELECT c FROM Customer c WHERE c.user.email = :email")
    Optional<Customer> findByUserEmail(@Param("email") String email);
    
    /**
     * TÃƒÂ¬m customer theo username cÃ¡Â»Â§a user
     */
    @Query("SELECT c FROM Customer c WHERE c.user.username = :username")
    Optional<Customer> findByUserUsername(@Param("username") String username);
    
    /**
     * KiÃ¡Â»Æ’m tra customer code Ã„â€˜ÃƒÂ£ tÃ¡Â»â€œn tÃ¡ÂºÂ¡i chÃ†Â°a
     */
    boolean existsByCustomerCode(String customerCode);
    
    // ==================== Customer Type Queries ====================
    
    /**
     * LÃ¡ÂºÂ¥y tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ customers theo loÃ¡ÂºÂ¡i
     */
    List<Customer> findByCustomerType(CustomerType customerType);
    
    /**
     * LÃ¡ÂºÂ¥y customers lÃƒÂ  cÃƒÂ¡ nhÃƒÂ¢n
     */
    @Query("SELECT c FROM Customer c WHERE c.customerType = 'INDIVIDUAL'")
    List<Customer> findIndividualCustomers();
    
    /**
     * LÃ¡ÂºÂ¥y customers lÃƒÂ  cÃƒÂ´ng ty
     */
    @Query("SELECT c FROM Customer c WHERE c.customerType = 'COMPANY'")
    List<Customer> findCompanyCustomers();
    
    /**
     * Ã„ÂÃ¡ÂºÂ¿m customers theo loÃ¡ÂºÂ¡i
     */
    Long countByCustomerType(CustomerType customerType);
    
    // ==================== Membership Level Queries ====================
    
    /**
     * LÃ¡ÂºÂ¥y customers theo membership level
     */
    List<Customer> findByMembershipLevel(MembershipLevel membershipLevel);
    
    /**
     * LÃ¡ÂºÂ¥y VIP customers (Gold, Platinum)
     */
    @Query("SELECT c FROM Customer c WHERE c.membershipLevel IN ('GOLD', 'PLATINUM')")
    List<Customer> findVipCustomers();
    
    /**
     * LÃ¡ÂºÂ¥y top customers theo loyalty points
     */
    List<Customer> findTop10ByOrderByLoyaltyPointsDesc();
    
    /**
     * Ã„ÂÃ¡ÂºÂ¿m customers theo membership level
     */
    Long countByMembershipLevel(MembershipLevel membershipLevel);
    
    // ==================== Loyalty Points Queries ====================
    
    /**
     * TÃƒÂ¬m customers cÃƒÂ³ loyalty points trong khoÃ¡ÂºÂ£ng
     */
    List<Customer> findByLoyaltyPointsBetween(Integer minPoints, Integer maxPoints);
    
    /**
     * TÃƒÂ¬m customers cÃƒÂ³ loyalty points >= giÃƒÂ¡ trÃ¡Â»â€¹
     */
    List<Customer> findByLoyaltyPointsGreaterThanEqual(Integer points);
    
    /**
     * TÃƒÂ¬m customers sÃ¡ÂºÂ¯p lÃƒÂªn hÃ¡ÂºÂ¡ng (trong khoÃ¡ÂºÂ£ng Ã„â€˜iÃ¡Â»Æ’m nhÃ¡ÂºÂ¥t Ã„â€˜Ã¡Â»â€¹nh)
     * VD: TÃƒÂ¬m SILVER customers cÃƒÂ³ 4500-4999 points (gÃ¡ÂºÂ§n Ã„â€˜Ã¡ÂºÂ¡t GOLD 5000)
     */
    @Query("SELECT c FROM Customer c WHERE c.membershipLevel = :currentLevel AND c.loyaltyPoints BETWEEN :minPoints AND :maxPoints")
    List<Customer> findCustomersNearUpgrade(
        @Param("currentLevel") MembershipLevel currentLevel,
        @Param("minPoints") Integer minPoints,
        @Param("maxPoints") Integer maxPoints
    );
    
    // ==================== Credit Limit Queries ====================
    
    /**
     * TÃƒÂ¬m customers theo credit limit
     */
    List<Customer> findByCreditLimitGreaterThanEqual(BigDecimal creditLimit);
    
    /**
     * TÃƒÂ¬m customers cÃƒÂ³ credit limit cao nhÃ¡ÂºÂ¥t
     */
    List<Customer> findTop10ByOrderByCreditLimitDesc();
    
    /**
     * TÃƒÂ¬m customers cÃƒÂ³ credit limit trong khoÃ¡ÂºÂ£ng
     */
    @Query("SELECT c FROM Customer c WHERE c.creditLimit BETWEEN :minLimit AND :maxLimit")
    List<Customer> findByCreditLimitRange(
        @Param("minLimit") BigDecimal minLimit,
        @Param("maxLimit") BigDecimal maxLimit
    );
    
    // ==================== Location Queries ====================
    
    /**
     * TÃƒÂ¬m customers theo thÃƒÂ nh phÃ¡Â»â€˜
     */
    List<Customer> findByCity(String city);
    
    /**
     * TÃƒÂ¬m customers theo quÃ¡Â»â€˜c gia
     */
    List<Customer> findByCountry(String country);
    
    /**
     * TÃƒÂ¬m customers theo thÃƒÂ nh phÃ¡Â»â€˜ vÃƒÂ  quÃ¡Â»â€˜c gia
     */
    List<Customer> findByCityAndCountry(String city, String country);
    
    /**
     * Ã„ÂÃ¡ÂºÂ¿m customers theo quÃ¡Â»â€˜c gia
     */
    @Query("SELECT c.country, COUNT(c) FROM Customer c GROUP BY c.country")
    List<Object[]> countByCountry();
    
    /**
     * Ã„ÂÃ¡ÂºÂ¿m customers theo thÃƒÂ nh phÃ¡Â»â€˜
     */
    @Query("SELECT c.city, COUNT(c) FROM Customer c GROUP BY c.city")
    List<Object[]> countByCity();
    
    // ==================== Company Queries ====================
    
    /**
     * TÃƒÂ¬m company customer theo tÃƒÂªn cÃƒÂ´ng ty
     */
    List<Customer> findByCompanyNameContainingIgnoreCase(String companyName);
    
    /**
     * TÃƒÂ¬m customer theo mÃƒÂ£ sÃ¡Â»â€˜ thuÃ¡ÂºÂ¿
     */
    Optional<Customer> findByTaxCode(String taxCode);
    
    /**
     * KiÃ¡Â»Æ’m tra mÃƒÂ£ sÃ¡Â»â€˜ thuÃ¡ÂºÂ¿ Ã„â€˜ÃƒÂ£ tÃ¡Â»â€œn tÃ¡ÂºÂ¡i chÃ†Â°a
     */
    boolean existsByTaxCode(String taxCode);
    
    // ==================== Search Queries ====================
    
    /**
     * TÃƒÂ¬m kiÃ¡ÂºÂ¿m customers (theo code, company name, user info)
     */
    @Query("SELECT c FROM Customer c WHERE " +
           "LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.user.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Customer> searchCustomers(@Param("keyword") String keyword);
    
    // ==================== Date Range Queries ====================
    
    /**
     * TÃƒÂ¬m customers tÃ¡ÂºÂ¡o trong khoÃ¡ÂºÂ£ng thÃ¡Â»Âi gian
     */
    List<Customer> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * TÃƒÂ¬m customers mÃ¡Â»â€ºi (top N)
     */
    List<Customer> findTop20ByOrderByCreatedAtDesc();
    
    /**
     * TÃƒÂ¬m customers tÃ¡ÂºÂ¡o trong thÃƒÂ¡ng hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i
     */
    @Query("SELECT c FROM Customer c WHERE YEAR(c.createdAt) = YEAR(CURRENT_DATE) AND MONTH(c.createdAt) = MONTH(CURRENT_DATE)")
    List<Customer> findCustomersCreatedThisMonth();
    
    // ==================== Active User Queries ====================
    
    /**
     * LÃ¡ÂºÂ¥y customers cÃƒÂ³ user Ã„â€˜ang active
     */
    @Query("SELECT c FROM Customer c WHERE c.user.isActive = true")
    List<Customer> findActiveCustomers();
    
    /**
     * LÃ¡ÂºÂ¥y customers cÃƒÂ³ user bÃ¡Â»â€¹ vÃƒÂ´ hiÃ¡Â»â€¡u hÃƒÂ³a
     */
    @Query("SELECT c FROM Customer c WHERE c.user.isActive = false")
    List<Customer> findInactiveCustomers();
    
    /**
     * Ã„ÂÃ¡ÂºÂ¿m active customers
     */
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.user.isActive = true")
    Long countActiveCustomers();
    
    // ==================== Statistics Queries ====================
    
    /**
     * TÃƒÂ­nh tÃ¡Â»â€¢ng loyalty points cÃ¡Â»Â§a tÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ customers
     */
    @Query("SELECT SUM(c.loyaltyPoints) FROM Customer c")
    Long getTotalLoyaltyPoints();
    
    /**
     * TÃƒÂ­nh trung bÃƒÂ¬nh loyalty points
     */
    @Query("SELECT AVG(c.loyaltyPoints) FROM Customer c")
    Double getAverageLoyaltyPoints();
    
    /**
     * TÃƒÂ­nh tÃ¡Â»â€¢ng credit limit
     */
    @Query("SELECT SUM(c.creditLimit) FROM Customer c")
    BigDecimal getTotalCreditLimit();
    
    /**
     * LÃ¡ÂºÂ¥y customer statistics theo membership level
     */
    @Query("SELECT c.membershipLevel, COUNT(c), SUM(c.loyaltyPoints), AVG(c.creditLimit) FROM Customer c GROUP BY c.membershipLevel")
    List<Object[]> getStatisticsByMembershipLevel();
}




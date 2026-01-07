package com.example.seatrans.features.auth.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.auth.model.Employee;

/**
 * Repository interface cho Employee entity
 */
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    // ==================== Basic Queries ====================
    
    /**
     * TÃ¬m employee theo user ID
     */
    Optional<Employee> findByUserId(Long userId);
    
    /**
     * TÃ¬m employee theo employee code
     */
    Optional<Employee> findByEmployeeCode(String employeeCode);
    
    /**
     * TÃ¬m employee theo email cá»§a user
     */
    @Query("SELECT e FROM Employee e WHERE e.user.email = :email")
    Optional<Employee> findByUserEmail(@Param("email") String email);
    
    /**
     * TÃ¬m employee theo username cá»§a user
     */
    @Query("SELECT e FROM Employee e WHERE e.user.username = :username")
    Optional<Employee> findByUserUsername(@Param("username") String username);
    
    /**
     * Kiá»ƒm tra employee code Ä‘Ã£ tá»“n táº¡i chÆ°a
     */
    boolean existsByEmployeeCode(String employeeCode);
    
    // ==================== Position Queries ====================
    
    /**
     * TÃ¬m employees theo position
     */
    List<Employee> findByPositionContainingIgnoreCase(String position);
    
    // ==================== Manager Queries ====================
    
    /**
     * Láº¥y táº¥t cáº£ managers (employees cÃ³ subordinates)
     */
    @Query("SELECT DISTINCT e FROM Employee e WHERE SIZE(e.subordinates) > 0")
    List<Employee> findAllManagers();
    
    /**
     * Láº¥y subordinates cá»§a má»™t manager
     */
    @Query("SELECT e FROM Employee e WHERE e.manager.id = :managerId")
    List<Employee> findSubordinatesByManagerId(@Param("managerId") Long managerId);
    
    /**
     * Láº¥y employees khÃ´ng cÃ³ manager (top-level)
     */
    List<Employee> findByManagerIsNull();
    
    /**
     * Äáº¿m subordinates cá»§a manager
     */
    @Query("SELECT COUNT(e) FROM Employee e WHERE e.manager.id = :managerId")
    Long countSubordinates(@Param("managerId") Long managerId);
    
    /**
     * Kiá»ƒm tra employee cÃ³ pháº£i manager khÃ´ng
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Employee e WHERE e.manager.id = :employeeId")
    boolean isManager(@Param("employeeId") Long employeeId);
    
    // ==================== Salary Queries ====================
    
    /**
     * TÃ¬m employees theo khoáº£ng lÆ°Æ¡ng
     */
    @Query("SELECT e FROM Employee e WHERE e.salary BETWEEN :minSalary AND :maxSalary")
    List<Employee> findBySalaryRange(
        @Param("minSalary") BigDecimal minSalary,
        @Param("maxSalary") BigDecimal maxSalary
    );
    
    /**
     * TÃ¬m employees cÃ³ lÆ°Æ¡ng >= giÃ¡ trá»‹
     */
    List<Employee> findBySalaryGreaterThanEqual(BigDecimal salary);
    
    /**
     * Láº¥y top earners
     */
    List<Employee> findTop10ByOrderBySalaryDesc();
    
    /**
     * TÃ­nh trung bÃ¬nh lÆ°Æ¡ng
     */
    @Query("SELECT AVG(e.salary) FROM Employee e WHERE e.isActive = true")
    Double getAverageSalary();
    
    // ==================== Commission Queries ====================
    
    /**
     * TÃ¬m employees cÃ³ commission rate
     */
    @Query("SELECT e FROM Employee e WHERE e.commissionRate > 0")
    List<Employee> findEmployeesWithCommission();
    
    /**
     * TÃ¬m employees theo khoáº£ng commission rate
     */
    @Query("SELECT e FROM Employee e WHERE e.commissionRate BETWEEN :minRate AND :maxRate")
    List<Employee> findByCommissionRateRange(
        @Param("minRate") BigDecimal minRate,
        @Param("maxRate") BigDecimal maxRate
    );
    
    // ==================== Hire Date Queries ====================
    
    /**
     * TÃ¬m employees theo khoáº£ng hire date
     */
    List<Employee> findByHireDateBetween(LocalDate startDate, LocalDate endDate);
    
    /**
     * TÃ¬m employees Ä‘Æ°á»£c tuyá»ƒn trong nÄƒm
     */
    @Query("SELECT e FROM Employee e WHERE YEAR(e.hireDate) = :year")
    List<Employee> findByHireYear(@Param("year") int year);
    
    /**
     * TÃ¬m employees cÃ³ thÃ¢m niÃªn >= sá»‘ nÄƒm
     */
    @Query("SELECT e FROM Employee e WHERE e.hireDate <= :date")
    List<Employee> findBySeniorityYears(@Param("date") LocalDate date);
    
    /**
     * TÃ¬m newest employees
     */
    List<Employee> findTop20ByOrderByHireDateDesc();
    
    /**
     * TÃ¬m employees cÃ³ ká»· niá»‡m ngÃ y vÃ o lÃ m trong thÃ¡ng
     */
    @Query("SELECT e FROM Employee e WHERE MONTH(e.hireDate) = MONTH(CURRENT_DATE)")
    List<Employee> findEmployeesWithAnniversaryThisMonth();
    
    // ==================== Status Queries ====================
    
    /**
     * Láº¥y active employees
     */
    List<Employee> findByIsActiveTrue();
    
    /**
     * Láº¥y inactive employees
     */
    List<Employee> findByIsActiveFalse();
    
    /**
     * Láº¥y employees theo status
     */
    List<Employee> findByIsActive(Boolean isActive);
    
    /**
     * Äáº¿m active employees
     */
    Long countByIsActiveTrue();
    
    /**
     * Äáº¿m inactive employees
     */
    Long countByIsActiveFalse();
    
    /**
     * Láº¥y active employees cÃ³ user active
     */
    @Query("SELECT e FROM Employee e WHERE e.isActive = true AND e.user.isActive = true")
    List<Employee> findFullyActiveEmployees();
    
    // ==================== Search Queries ====================
    
    /**
     * TÃ¬m kiáº¿m employees (theo code, position, user info)
     */
    @Query("SELECT e FROM Employee e WHERE " +
           "LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.position) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.user.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Employee> searchEmployees(@Param("keyword") String keyword);
    
    // ==================== Date Range Queries ====================
    
    /**
     * TÃ¬m employees táº¡o trong khoáº£ng thá»i gian
     */
    List<Employee> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * TÃ¬m employees táº¡o trong thÃ¡ng hiá»‡n táº¡i
     */
    @Query("SELECT e FROM Employee e WHERE YEAR(e.createdAt) = YEAR(CURRENT_DATE) AND MONTH(e.createdAt) = MONTH(CURRENT_DATE)")
    List<Employee> findEmployeesCreatedThisMonth();
    
    // ==================== Complex Queries ====================
    
    /**
     * Láº¥y team hierarchy (manager + subordinates)
     */
    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.subordinates WHERE e.id = :managerId")
    Optional<Employee> findManagerWithSubordinates(@Param("managerId") Long managerId);
    
    /**
     * Láº¥y top performers (salary + commission cao)
     */
    @Query("SELECT e FROM Employee e WHERE e.isActive = true ORDER BY (e.salary + (e.salary * e.commissionRate / 100)) DESC")
    List<Employee> findTopPerformers();
    
    // ==================== Statistics Queries ====================
    
    /**
     * Äáº¿m tá»•ng employees
     */
    @Query("SELECT COUNT(e) FROM Employee e")
    Long countTotalEmployees();
    
    /**
     * TÃ­nh tá»•ng payroll (tá»•ng lÆ°Æ¡ng)
     */
    @Query("SELECT SUM(e.salary) FROM Employee e WHERE e.isActive = true")
    BigDecimal getTotalPayroll();
    
}



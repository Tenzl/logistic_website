package com.example.seatrans.features.user.service;

import com.example.seatrans.features.user.model.Employee;
import com.example.seatrans.features.user.model.User;
import com.example.seatrans.features.user.model.enums.Department;
import com.example.seatrans.features.user.repository.EmployeeRepository;
import com.example.seatrans.features.user.repository.UserRepository;
import com.example.seatrans.shared.exception.EmployeeNotFoundException;
import com.example.seatrans.shared.exception.InvalidEmployeeDataException;
import com.example.seatrans.shared.exception.UserNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Service xá»­ lÃ½ business logic cho Employee
 */
@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    // ==================== Create Operations ====================

    /**
     * Táº¡o employee má»›i
     */
    public Employee createEmployee(Employee employee) {
        // Validate employee data
        validateEmployeeData(employee);

        // Kiá»ƒm tra user tá»“n táº¡i
        if (employee.getUser() != null && employee.getUser().getId() != null) {
            User user = userRepository.findById(employee.getUser().getId())
                    .orElseThrow(() -> new UserNotFoundException(employee.getUser().getId()));
            employee.setUser(user);
        }

        return employeeRepository.save(employee);
    }

    /**
     * Táº¡o employee cho user Ä‘Ã£ tá»“n táº¡i
     */
    public Employee createEmployeeForUser(Long userId, Employee employee) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // Kiá»ƒm tra user Ä‘Ã£ cÃ³ employee chÆ°a
        if (user.getEmployee() != null) {
            throw new InvalidEmployeeDataException("User already has employee information");
        }

        employee.setUser(user);
        validateEmployeeData(employee);

        return employeeRepository.save(employee);
    }

    // ==================== Read Operations ====================

    /**
     * Láº¥y employee theo ID
     */
    @Transactional(readOnly = true)
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));
    }

    /**
     * Láº¥y employee theo user ID
     */
    @Transactional(readOnly = true)
    public Employee getEmployeeByUserId(Long userId) {
        return employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new EmployeeNotFoundException("userId", userId.toString()));
    }

    /**
     * Láº¥y employee theo employee code
     */
    @Transactional(readOnly = true)
    public Employee getEmployeeByCode(String employeeCode) {
        return employeeRepository.findByEmployeeCode(employeeCode)
                .orElseThrow(() -> new EmployeeNotFoundException("employeeCode", employeeCode));
    }

    /**
     * Láº¥y táº¥t cáº£ employees
     */
    @Transactional(readOnly = true)
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    /**
     * Láº¥y active employees
     */
    @Transactional(readOnly = true)
    public List<Employee> getActiveEmployees() {
        return employeeRepository.findByIsActiveTrue();
    }

    /**
     * Láº¥y employees theo department
     */
    @Transactional(readOnly = true)
    public List<Employee> getEmployeesByDepartment(Department department) {
        return employeeRepository.findByDepartment(department);
    }

    /**
     * Láº¥y active employees theo department
     */
    @Transactional(readOnly = true)
    public List<Employee> getActiveEmployeesByDepartment(Department department) {
        return employeeRepository.findByDepartmentAndIsActiveTrue(department);
    }

    /**
     * TÃ¬m kiáº¿m employees
     */
    @Transactional(readOnly = true)
    public List<Employee> searchEmployees(String keyword) {
        return employeeRepository.searchEmployees(keyword);
    }

    // ==================== Update Operations ====================

    /**
     * Cáº­p nháº­t employee information
     */
    public Employee updateEmployee(Long employeeId, Employee updatedEmployee) {
        Employee existingEmployee = getEmployeeById(employeeId);

        // Update fields
        if (updatedEmployee.getDepartment() != null) {
            existingEmployee.setDepartment(updatedEmployee.getDepartment());
        }
        if (updatedEmployee.getPosition() != null) {
            existingEmployee.setPosition(updatedEmployee.getPosition());
        }
        if (updatedEmployee.getSalary() != null) {
            existingEmployee.setSalary(updatedEmployee.getSalary());
        }
        if (updatedEmployee.getCommissionRate() != null) {
            existingEmployee.setCommissionRate(updatedEmployee.getCommissionRate());
        }

        // Validate sau khi update
        validateEmployeeData(existingEmployee);

        return employeeRepository.save(existingEmployee);
    }

    /**
     * Set manager cho employee
     */
    public Employee setManager(Long employeeId, Long managerId) {
        Employee employee = getEmployeeById(employeeId);

        if (managerId == null) {
            employee.setManager(null);
        } else {
            Employee manager = getEmployeeById(managerId);

            // Validate khÃ´ng thá»ƒ tá»± lÃ m manager cá»§a mÃ¬nh
            if (employeeId.equals(managerId)) {
                throw new InvalidEmployeeDataException("Employee cannot be their own manager");
            }

            // Validate khÃ´ng táº¡o circular reference
            if (isManagerOf(employeeId, managerId)) {
                throw new InvalidEmployeeDataException("Cannot create circular manager relationship");
            }

            employee.setManager(manager);
        }

        return employeeRepository.save(employee);
    }

    /**
     * Activate employee
     */
    public Employee activateEmployee(Long employeeId) {
        Employee employee = getEmployeeById(employeeId);
        employee.setIsActive(true);
        return employeeRepository.save(employee);
    }

    /**
     * Deactivate employee
     */
    public Employee deactivateEmployee(Long employeeId) {
        Employee employee = getEmployeeById(employeeId);
        employee.setIsActive(false);
        return employeeRepository.save(employee);
    }

    // ==================== Manager Operations ====================

    /**
     * Láº¥y táº¥t cáº£ managers
     */
    @Transactional(readOnly = true)
    public List<Employee> getAllManagers() {
        return employeeRepository.findAllManagers();
    }

    /**
     * Láº¥y subordinates cá»§a manager
     */
    @Transactional(readOnly = true)
    public List<Employee> getSubordinates(Long managerId) {
        return employeeRepository.findSubordinatesByManagerId(managerId);
    }

    /**
     * Láº¥y táº¥t cáº£ subordinates (bao gá»“m nested)
     */
    @Transactional(readOnly = true)
    public List<Employee> getAllSubordinates(Long managerId) {
        Employee manager = getEmployeeById(managerId);
        return manager.getAllSubordinates();
    }

    /**
     * Kiá»ƒm tra employee cÃ³ pháº£i manager khÃ´ng
     */
    @Transactional(readOnly = true)
    public boolean isManager(Long employeeId) {
        return employeeRepository.isManager(employeeId);
    }

    /**
     * Kiá»ƒm tra employee A cÃ³ pháº£i manager cá»§a employee B khÃ´ng
     */
    @Transactional(readOnly = true)
    public boolean isManagerOf(Long managerId, Long employeeId) {
        Employee manager = getEmployeeById(managerId);
        Employee employee = getEmployeeById(employeeId);
        return manager.isManagerOf(employee);
    }

    /**
     * Láº¥y colleagues (cÃ¹ng department)
     */
    @Transactional(readOnly = true)
    public List<Employee> getColleagues(Long employeeId) {
        return employeeRepository.findColleagues(employeeId);
    }

    // ==================== Salary & Commission ====================

    /**
     * Set salary
     */
    public Employee setSalary(Long employeeId, BigDecimal salary) {
        if (salary.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Salary cannot be negative");
        }

        Employee employee = getEmployeeById(employeeId);
        employee.setSalary(salary);

        return employeeRepository.save(employee);
    }

    /**
     * Set commission rate
     */
    public Employee setCommissionRate(Long employeeId, BigDecimal rate) {
        if (rate.compareTo(BigDecimal.ZERO) < 0 || rate.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Commission rate must be between 0 and 100");
        }

        Employee employee = getEmployeeById(employeeId);
        employee.setCommissionRate(rate);

        return employeeRepository.save(employee);
    }

    /**
     * TÃ­nh commission cho order
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateCommission(Long employeeId, BigDecimal orderAmount) {
        Employee employee = getEmployeeById(employeeId);
        return employee.calculateCommission(orderAmount);
    }

    /**
     * Láº¥y top earners
     */
    @Transactional(readOnly = true)
    public List<Employee> getTopEarners(int limit) {
        return employeeRepository.findTop10ByOrderBySalaryDesc();
    }

    // ==================== Seniority ====================

    /**
     * TÃ­nh sá»‘ nÄƒm lÃ m viá»‡c
     */
    @Transactional(readOnly = true)
    public int getYearsOfService(Long employeeId) {
        Employee employee = getEmployeeById(employeeId);
        return employee.getYearsOfService();
    }

    /**
     * Láº¥y employees cÃ³ thÃ¢m niÃªn >= sá»‘ nÄƒm
     */
    @Transactional(readOnly = true)
    public List<Employee> getEmployeesBySeniority(int years) {
        LocalDate date = LocalDate.now().minusYears(years);
        return employeeRepository.findBySeniorityYears(date);
    }

    /**
     * Láº¥y employees cÃ³ ká»· niá»‡m trong thÃ¡ng
     */
    @Transactional(readOnly = true)
    public List<Employee> getEmployeesWithAnniversaryThisMonth() {
        return employeeRepository.findEmployeesWithAnniversaryThisMonth();
    }

    // ==================== Delete Operations ====================

    /**
     * XÃ³a employee
     */
    public void deleteEmployee(Long employeeId) {
        Employee employee = getEmployeeById(employeeId);

        // Kiá»ƒm tra cÃ³ subordinates khÃ´ng
        if (isManager(employeeId)) {
            throw new InvalidEmployeeDataException("Cannot delete employee who is managing other employees");
        }

        employeeRepository.delete(employee);
    }

    // ==================== Validation ====================

    /**
     * Validate employee data
     */
    private void validateEmployeeData(Employee employee) {
        // Hire date khÃ´ng trong tÆ°Æ¡ng lai
        if (employee.getHireDate() != null && employee.getHireDate().isAfter(LocalDate.now())) {
            throw new InvalidEmployeeDataException("Hire date cannot be in the future");
        }

        // Salary khÃ´ng Ã¢m
        if (employee.getSalary() != null && employee.getSalary().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidEmployeeDataException("Salary cannot be negative");
        }

        // Commission rate 0-100
        if (employee.getCommissionRate() != null) {
            if (employee.getCommissionRate().compareTo(BigDecimal.ZERO) < 0 ||
                    employee.getCommissionRate().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new InvalidEmployeeDataException("Commission rate must be between 0 and 100");
            }
        }

        // Manager khÃ´ng thá»ƒ tá»± refer
        if (employee.getManager() != null && employee.getId() != null) {
            if (employee.getId().equals(employee.getManager().getId())) {
                throw new InvalidEmployeeDataException("Employee cannot be their own manager");
            }
        }
    }

    // ==================== Statistics ====================

    /**
     * Äáº¿m tá»•ng employees
     */
    @Transactional(readOnly = true)
    public Long countTotalEmployees() {
        return employeeRepository.count();
    }

    /**
     * Äáº¿m active employees
     */
    @Transactional(readOnly = true)
    public Long countActiveEmployees() {
        return employeeRepository.countByIsActiveTrue();
    }

    /**
     * Äáº¿m employees theo department
     */
    @Transactional(readOnly = true)
    public Long countEmployeesByDepartment(Department department) {
        return employeeRepository.countByDepartment(department);
    }

    /**
     * TÃ­nh tá»•ng payroll
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalPayroll() {
        return employeeRepository.getTotalPayroll();
    }

    /**
     * TÃ­nh trung bÃ¬nh salary
     */
    @Transactional(readOnly = true)
    public Double getAverageSalary() {
        return employeeRepository.getAverageSalary();
    }

    /**
     * TÃ­nh trung bÃ¬nh salary theo department
     */
    @Transactional(readOnly = true)
    public Double getAverageSalaryByDepartment(Department department) {
        return employeeRepository.getAverageSalaryByDepartment(department);
    }
}

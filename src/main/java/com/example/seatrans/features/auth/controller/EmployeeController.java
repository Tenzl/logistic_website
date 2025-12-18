package com.example.seatrans.features.auth.controller;

import com.example.seatrans.shared.dto.ApiResponse;
import com.example.seatrans.features.auth.dto.EmployeeDTO;
import com.example.seatrans.features.auth.model.Employee;
import com.example.seatrans.features.auth.model.enums.Department;
import com.example.seatrans.shared.mapper.EntityMapper;
import com.example.seatrans.features.auth.service.EmployeeService;
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
 * Controller xá»­ lÃ½ Employee management
 */
@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Validated
public class EmployeeController {
    
    private final EmployeeService employeeService;
    private final EntityMapper entityMapper;
    
    // ==================== Create Operations ====================
    
    /**
     * POST /api/employees
     * Táº¡o employee má»›i
     */
    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeDTO>> createEmployee(@Valid @RequestBody EmployeeDTO employeeDTO) {
        Employee employee = entityMapper.toEmployeeEntity(employeeDTO);
        Employee createdEmployee = employeeService.createEmployee(employee);
        EmployeeDTO responseDTO = entityMapper.toEmployeeDTO(createdEmployee);
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee created successfully", responseDTO));
    }
    
    /**
     * POST /api/employees/user/{userId}
     * Táº¡o employee cho user Ä‘Ã£ tá»“n táº¡i
     */
    @PostMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> createEmployeeForUser(
            @PathVariable Long userId,
            @Valid @RequestBody EmployeeDTO employeeDTO) {
        
        Employee employee = entityMapper.toEmployeeEntity(employeeDTO);
        Employee createdEmployee = employeeService.createEmployeeForUser(userId, employee);
        EmployeeDTO responseDTO = entityMapper.toEmployeeDTO(createdEmployee);
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee created for user", responseDTO));
    }
    
    // ==================== Read Operations ====================
    
    /**
     * GET /api/employees
     * Láº¥y táº¥t cáº£ employees
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getAllEmployees() {
        List<Employee> employees = employeeService.getAllEmployees();
        List<EmployeeDTO> employeeDTOs = employees.stream()
                .map(entityMapper::toEmployeeDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(employeeDTOs));
    }
    
    /**
     * GET /api/employees/{id}
     * Láº¥y employee theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeService.getEmployeeById(id);
        EmployeeDTO employeeDTO = entityMapper.toEmployeeDTO(employee);
        
        return ResponseEntity.ok(ApiResponse.success(employeeDTO));
    }
    
    /**
     * GET /api/employees/user/{userId}
     * Láº¥y employee theo user ID
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> getEmployeeByUserId(@PathVariable Long userId) {
        Employee employee = employeeService.getEmployeeByUserId(userId);
        EmployeeDTO employeeDTO = entityMapper.toEmployeeDTO(employee);
        
        return ResponseEntity.ok(ApiResponse.success(employeeDTO));
    }
    
    /**
     * GET /api/employees/code/{employeeCode}
     * Láº¥y employee theo employee code
     */
    @GetMapping("/code/{employeeCode}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> getEmployeeByCode(@PathVariable String employeeCode) {
        Employee employee = employeeService.getEmployeeByCode(employeeCode);
        EmployeeDTO employeeDTO = entityMapper.toEmployeeDTO(employee);
        
        return ResponseEntity.ok(ApiResponse.success(employeeDTO));
    }
    
    /**
     * GET /api/employees/active
     * Láº¥y active employees
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getActiveEmployees() {
        List<Employee> employees = employeeService.getActiveEmployees();
        List<EmployeeDTO> employeeDTOs = employees.stream()
                .map(entityMapper::toEmployeeDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(employeeDTOs));
    }
    
    /**
     * GET /api/employees/department/{department}
     * Láº¥y employees theo department
     */
    @GetMapping("/department/{department}")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getEmployeesByDepartment(@PathVariable Department department) {
        List<Employee> employees = employeeService.getEmployeesByDepartment(department);
        List<EmployeeDTO> employeeDTOs = employees.stream()
                .map(entityMapper::toEmployeeDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(employeeDTOs));
    }
    
    /**
     * GET /api/employees/department/{department}/active
     * Láº¥y active employees theo department
     */
    @GetMapping("/department/{department}/active")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getActiveEmployeesByDepartment(@PathVariable Department department) {
        List<Employee> employees = employeeService.getActiveEmployeesByDepartment(department);
        List<EmployeeDTO> employeeDTOs = employees.stream()
                .map(entityMapper::toEmployeeDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(employeeDTOs));
    }
    
    /**
     * GET /api/employees/search?keyword={keyword}
     * TÃ¬m kiáº¿m employees
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> searchEmployees(@RequestParam String keyword) {
        List<Employee> employees = employeeService.searchEmployees(keyword);
        List<EmployeeDTO> employeeDTOs = employees.stream()
                .map(entityMapper::toEmployeeDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(employeeDTOs));
    }
    
    // ==================== Update Operations ====================
    
    /**
     * PUT /api/employees/{id}
     * Cáº­p nháº­t employee info
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeDTO employeeDTO) {
        
        Employee updatedEmployee = entityMapper.toEmployeeEntity(employeeDTO);
        Employee employee = employeeService.updateEmployee(id, updatedEmployee);
        EmployeeDTO responseDTO = entityMapper.toEmployeeDTO(employee);
        
        return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", responseDTO));
    }
    
    /**
     * PUT /api/employees/{id}/manager
     * Set manager cho employee
     */
    @PutMapping("/{id}/manager")
    public ResponseEntity<ApiResponse<EmployeeDTO>> setManager(
            @PathVariable Long id,
            @RequestParam(required = false) Long managerId) {
        
        Employee employee = employeeService.setManager(id, managerId);
        EmployeeDTO employeeDTO = entityMapper.toEmployeeDTO(employee);
        
        return ResponseEntity.ok(ApiResponse.success("Manager updated", employeeDTO));
    }
    
    /**
     * PUT /api/employees/{id}/activate
     * Activate employee
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<EmployeeDTO>> activateEmployee(@PathVariable Long id) {
        Employee employee = employeeService.activateEmployee(id);
        EmployeeDTO employeeDTO = entityMapper.toEmployeeDTO(employee);
        
        return ResponseEntity.ok(ApiResponse.success("Employee activated", employeeDTO));
    }
    
    /**
     * PUT /api/employees/{id}/deactivate
     * Deactivate employee
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<EmployeeDTO>> deactivateEmployee(@PathVariable Long id) {
        Employee employee = employeeService.deactivateEmployee(id);
        EmployeeDTO employeeDTO = entityMapper.toEmployeeDTO(employee);
        
        return ResponseEntity.ok(ApiResponse.success("Employee deactivated", employeeDTO));
    }
    
    // ==================== Manager Operations ====================
    
    /**
     * GET /api/employees/managers
     * Láº¥y táº¥t cáº£ managers
     */
    @GetMapping("/managers")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getAllManagers() {
        List<Employee> managers = employeeService.getAllManagers();
        List<EmployeeDTO> managerDTOs = managers.stream()
                .map(entityMapper::toEmployeeDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(managerDTOs));
    }
    
    /**
     * GET /api/employees/{id}/subordinates
     * Láº¥y subordinates cá»§a manager
     */
    @GetMapping("/{id}/subordinates")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getSubordinates(@PathVariable Long id) {
        List<Employee> subordinates = employeeService.getSubordinates(id);
        List<EmployeeDTO> subordinateDTOs = subordinates.stream()
                .map(entityMapper::toEmployeeDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(subordinateDTOs));
    }
    
    /**
     * GET /api/employees/{id}/subordinates/all
     * Láº¥y táº¥t cáº£ subordinates (bao gá»“m nested)
     */
    @GetMapping("/{id}/subordinates/all")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getAllSubordinates(@PathVariable Long id) {
        List<Employee> subordinates = employeeService.getAllSubordinates(id);
        List<EmployeeDTO> subordinateDTOs = subordinates.stream()
                .map(entityMapper::toEmployeeDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(subordinateDTOs));
    }
    
    /**
     * GET /api/employees/{id}/colleagues
     * Láº¥y colleagues (cÃ¹ng department)
     */
    @GetMapping("/{id}/colleagues")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getColleagues(@PathVariable Long id) {
        List<Employee> colleagues = employeeService.getColleagues(id);
        List<EmployeeDTO> colleagueDTOs = colleagues.stream()
                .map(entityMapper::toEmployeeDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(colleagueDTOs));
    }
    
    // ==================== Salary & Commission ====================
    
    /**
     * PUT /api/employees/{id}/salary
     * Set salary
     */
    @PutMapping("/{id}/salary")
    public ResponseEntity<ApiResponse<EmployeeDTO>> setSalary(
            @PathVariable Long id,
            @RequestParam BigDecimal salary) {
        
        Employee employee = employeeService.setSalary(id, salary);
        EmployeeDTO employeeDTO = entityMapper.toEmployeeDTO(employee);
        
        return ResponseEntity.ok(ApiResponse.success("Salary updated", employeeDTO));
    }
    
    /**
     * PUT /api/employees/{id}/commission-rate
     * Set commission rate
     */
    @PutMapping("/{id}/commission-rate")
    public ResponseEntity<ApiResponse<EmployeeDTO>> setCommissionRate(
            @PathVariable Long id,
            @RequestParam BigDecimal rate) {
        
        Employee employee = employeeService.setCommissionRate(id, rate);
        EmployeeDTO employeeDTO = entityMapper.toEmployeeDTO(employee);
        
        return ResponseEntity.ok(ApiResponse.success("Commission rate updated", employeeDTO));
    }
    
    /**
     * GET /api/employees/{id}/calculate-commission
     * TÃ­nh commission
     */
    @GetMapping("/{id}/calculate-commission")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateCommission(
            @PathVariable Long id,
            @RequestParam BigDecimal orderAmount) {
        
        BigDecimal commission = employeeService.calculateCommission(id, orderAmount);
        
        return ResponseEntity.ok(ApiResponse.success(commission));
    }
    
    // ==================== Delete Operations ====================
    
    /**
     * DELETE /api/employees/{id}
     * XÃ³a employee
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        
        return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully", null));
    }
    
    // ==================== Statistics ====================
    
    /**
     * GET /api/employees/stats/count
     * Äáº¿m tá»•ng employees
     */
    @GetMapping("/stats/count")
    public ResponseEntity<ApiResponse<Long>> countTotalEmployees() {
        Long count = employeeService.countTotalEmployees();
        
        return ResponseEntity.ok(ApiResponse.success(count));
    }
    
    /**
     * GET /api/employees/stats/active-count
     * Äáº¿m active employees
     */
    @GetMapping("/stats/active-count")
    public ResponseEntity<ApiResponse<Long>> countActiveEmployees() {
        Long count = employeeService.countActiveEmployees();
        
        return ResponseEntity.ok(ApiResponse.success(count));
    }
    
    /**
     * GET /api/employees/stats/total-payroll
     * Tá»•ng payroll
     */
    @GetMapping("/stats/total-payroll")
    public ResponseEntity<ApiResponse<BigDecimal>> getTotalPayroll() {
        BigDecimal total = employeeService.getTotalPayroll();
        
        return ResponseEntity.ok(ApiResponse.success(total));
    }
    
    /**
     * GET /api/employees/stats/average-salary
     * Trung bÃ¬nh salary
     */
    @GetMapping("/stats/average-salary")
    public ResponseEntity<ApiResponse<Double>> getAverageSalary() {
        Double average = employeeService.getAverageSalary();
        
        return ResponseEntity.ok(ApiResponse.success(average));
    }
}



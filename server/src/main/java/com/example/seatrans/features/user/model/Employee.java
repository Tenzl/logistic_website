package com.example.seatrans.features.user.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import com.example.seatrans.features.user.model.enums.Department;
import com.example.seatrans.shared.model.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "employee_code", unique = true, nullable = false, length = 20)
    private String employeeCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Department department;

    @Column(length = 100)
    private String position;

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(precision = 15, scale = 2)
    private BigDecimal salary;

    @Column(name = "commission_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal commissionRate = BigDecimal.ZERO;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @OneToMany(mappedBy = "manager")
    @Builder.Default
    private List<Employee> subordinates = new ArrayList<>();

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        if (employeeCode == null) {
            employeeCode = generateEmployeeCode();
        }
    }

    // Helper methods
    public List<Employee> getAllSubordinates() {
        List<Employee> allSubs = new ArrayList<>();
        for (Employee sub : subordinates) {
            allSubs.add(sub);
            allSubs.addAll(sub.getAllSubordinates());
        }
        return allSubs;
    }

    public boolean isManagerOf(Employee employee) {
        return subordinates.contains(employee) ||
                subordinates.stream().anyMatch(sub -> sub.isManagerOf(employee));
    }

    public BigDecimal calculateCommission(BigDecimal orderAmount) {
        return orderAmount.multiply(commissionRate)
                .divide(BigDecimal.valueOf(100));
    }

    public int getYearsOfService() {
        return Period.between(hireDate, LocalDate.now()).getYears();
    }

    private String generateEmployeeCode() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%04d", new Random().nextInt(10000));
        return "EMP-" + date + "-" + random;
    }
}

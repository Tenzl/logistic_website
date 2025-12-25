package com.example.seatrans.features.user._customer.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

import com.example.seatrans.features.user._customer.model.enums.CustomerType;
import com.example.seatrans.features.user._customer.model.enums.MembershipLevel;
import com.example.seatrans.features.user.model.User;
import com.example.seatrans.shared.model.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "customer_code", unique = true, nullable = false, length = 20)
    private String customerCode;

    @Column(name = "company_name", length = 200)
    private String companyName;

    @Column(name = "tax_code", length = 50)
    private String taxCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type", nullable = false, length = 20)
    private CustomerType customerType;

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String country;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "loyalty_points")
    @Builder.Default
    private Integer loyaltyPoints = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "membership_level", length = 20)
    @Builder.Default
    private MembershipLevel membershipLevel = MembershipLevel.BRONZE;

    @Column(name = "credit_limit", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal creditLimit = BigDecimal.ZERO;

    @PrePersist
    protected void onCreate() {
        if (customerCode == null) {
            customerCode = generateCustomerCode();
        }
    }

    // Helper methods
    public void addLoyaltyPoints(int points) {
        this.loyaltyPoints += points;
        updateMembershipLevel();
    }

    public void deductLoyaltyPoints(int points) {
        this.loyaltyPoints = Math.max(0, this.loyaltyPoints - points);
        updateMembershipLevel();
    }

    public void updateMembershipLevel() {
        if (loyaltyPoints >= 10000) {
            membershipLevel = MembershipLevel.PLATINUM;
        } else if (loyaltyPoints >= 5000) {
            membershipLevel = MembershipLevel.GOLD;
        } else if (loyaltyPoints >= 1000) {
            membershipLevel = MembershipLevel.SILVER;
        } else {
            membershipLevel = MembershipLevel.BRONZE;
        }
    }

    public boolean canPurchase(BigDecimal amount) {
        return amount.compareTo(creditLimit) <= 0;
    }

    private String generateCustomerCode() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%04d", new Random().nextInt(10000));
        return "CUST-" + date + "-" + random;
    }
}

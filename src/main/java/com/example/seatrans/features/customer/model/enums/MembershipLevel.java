package com.example.seatrans.features.customer.model.enums;

public enum MembershipLevel {
    BRONZE(0, 0),
    SILVER(1000, 5),
    GOLD(5000, 10),
    PLATINUM(10000, 15);
    
    private final int minPoints;
    private final int discountPercentage;
    
    MembershipLevel(int minPoints, int discountPercentage) {
        this.minPoints = minPoints;
        this.discountPercentage = discountPercentage;
    }
    
    public int getMinPoints() {
        return minPoints;
    }
    
    public int getDiscountPercentage() {
        return discountPercentage;
    }
    
    public static MembershipLevel fromPoints(int points) {
        if (points >= PLATINUM.minPoints) return PLATINUM;
        if (points >= GOLD.minPoints) return GOLD;
        if (points >= SILVER.minPoints) return SILVER;
        return BRONZE;
    }
}



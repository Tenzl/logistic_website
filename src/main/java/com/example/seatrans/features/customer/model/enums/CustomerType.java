package com.example.seatrans.features.customer.model.enums;

public enum CustomerType {
    INDIVIDUAL("Individual Customer"),
    COMPANY("Company/Business");
    
    private final String description;
    
    CustomerType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}



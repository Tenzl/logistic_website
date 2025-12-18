package com.example.seatrans.features.auth.model.enums;

public enum RoleGroup {
    INTERNAL("Internal Staff"),
    EXTERNAL("External Customers");
    
    private final String description;
    
    RoleGroup(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}


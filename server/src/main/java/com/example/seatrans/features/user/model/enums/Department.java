package com.example.seatrans.features.user.model.enums;

public enum Department {
    SALES("Sales Department"),
    OPERATIONS("Operations Department"),
    FINANCE("Finance Department"),
    CUSTOMER_SERVICE("Customer Service Department"),
    ADMINISTRATION("Administration Department"),
    IT("Information Technology Department");

    private final String description;

    Department(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

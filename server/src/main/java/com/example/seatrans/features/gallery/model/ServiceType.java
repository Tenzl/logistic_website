package com.example.seatrans.features.gallery.model;

/**
 * Enum for gallery image service types
 */
public enum ServiceType {
    SHIPPING_AGENCY("Shipping Agency"),
    CHARTERING_BROKING("Chartering & Broking"),
    FREIGHT_FORWARDING("Freight Forwarding"),
    TOTAL_LOGISTICS("Total Logistics");
    
    private final String displayName;
    
    ServiceType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}

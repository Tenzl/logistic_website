package com.example.seatrans.features.gallery.model;

/**
 * Enum for gallery image status
 */
public enum ImageStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive");
    
    private final String displayName;
    
    ImageStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}

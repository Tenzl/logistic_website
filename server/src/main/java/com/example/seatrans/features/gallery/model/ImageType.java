package com.example.seatrans.features.gallery.model;

/**
 * Enum for gallery image types
 */
public enum ImageType {
    GALLERY("Gallery"),
    CERTIFICATES("Certificates"),
    EQUIPMENT("Equipment"),
    OPERATIONS("Operations");
    
    private final String displayName;
    
    ImageType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}

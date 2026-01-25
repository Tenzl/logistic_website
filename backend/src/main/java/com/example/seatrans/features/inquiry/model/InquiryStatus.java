package com.example.seatrans.features.inquiry.model;

/**
 * Inquiry Status Enum
 * Represents the lifecycle status of a service inquiry
 */
public enum InquiryStatus {
    PENDING,      // Newly submitted, not yet processed
    PROCESSING,   // Being processed by staff
    QUOTED,       // Quote sent to customer
    COMPLETED,    // Inquiry completed/closed
    CANCELLED     // Inquiry cancelled
}

package com.example.seatrans.shared.exception;

/**
 * Exception ném ra khi không tìm thấy customer
 */
public class CustomerNotFoundException extends RuntimeException {
    
    public CustomerNotFoundException(String message) {
        super(message);
    }
    
    public CustomerNotFoundException(Long customerId) {
        super("Customer not found with ID: " + customerId);
    }
    
    public CustomerNotFoundException(String field, String value) {
        super(String.format("Customer not found with %s: %s", field, value));
    }
    
    public CustomerNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}

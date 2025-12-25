package com.example.seatrans.shared.exception;

/**
 * Exception ném ra khi không tìm thấy user
 */
public class UserNotFoundException extends RuntimeException {
    
    public UserNotFoundException(String message) {
        super(message);
    }
    
    public UserNotFoundException(Long userId) {
        super("User not found with ID: " + userId);
    }
    
    public UserNotFoundException(String field, String value) {
        super(String.format("User not found with %s: %s", field, value));
    }
    
    public UserNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}

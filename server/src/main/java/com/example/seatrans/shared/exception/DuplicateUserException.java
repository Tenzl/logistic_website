package com.example.seatrans.shared.exception;

/**
 * Exception ném ra khi username hoặc email đã tồn tại
 */
public class DuplicateUserException extends RuntimeException {
    
    public DuplicateUserException(String message) {
        super(message);
    }
    
    public DuplicateUserException(String field, String value) {
        super(String.format("%s already exists: %s", field, value));
    }
    
    public DuplicateUserException(String message, Throwable cause) {
        super(message, cause);
    }
}

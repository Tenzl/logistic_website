package com.example.seatrans.shared.exception;

/**
 * Exception ném ra khi không tìm thấy role
 */
public class RoleNotFoundException extends RuntimeException {
    
    public RoleNotFoundException(String message) {
        super(message);
    }
    
    public RoleNotFoundException(Long roleId) {
        super("Role not found with ID: " + roleId);
    }
    
    public RoleNotFoundException(String field, String value) {
        super(String.format("Role not found with %s: %s", field, value));
    }
    
    public RoleNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}

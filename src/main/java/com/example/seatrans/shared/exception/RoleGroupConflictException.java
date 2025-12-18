package com.example.seatrans.shared.exception;

/**
 * Exception ném ra khi cố gắng gán roles từ 2 role groups khác nhau cho cùng 1 user
 * VD: Không thể gán cả ROLE_ADMIN (INTERNAL) và ROLE_CUSTOMER (EXTERNAL)
 */
public class RoleGroupConflictException extends RuntimeException {
    
    public RoleGroupConflictException(String message) {
        super(message);
    }
    
    public RoleGroupConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}

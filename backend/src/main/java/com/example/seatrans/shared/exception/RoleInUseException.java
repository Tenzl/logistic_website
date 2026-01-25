package com.example.seatrans.shared.exception;

/**
 * Exception ném ra khi role không thể xóa vì còn users đang sử dụng
 */
public class RoleInUseException extends RuntimeException {
    
    public RoleInUseException(String message) {
        super(message);
    }
    
    public RoleInUseException(String roleName, Long userCount) {
        super(String.format("Cannot delete role '%s' because it is assigned to %d user(s)", roleName, userCount));
    }
    
    public RoleInUseException(String message, Throwable cause) {
        super(message, cause);
    }
}

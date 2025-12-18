package com.example.seatrans.shared.exception;

/**
 * Exception ném ra khi dữ liệu employee không hợp lệ
 * VD: Employee tự refer làm manager của chính mình
 */
public class InvalidEmployeeDataException extends RuntimeException {
    
    public InvalidEmployeeDataException(String message) {
        super(message);
    }
    
    public InvalidEmployeeDataException(String message, Throwable cause) {
        super(message, cause);
    }
}

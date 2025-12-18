package com.example.seatrans.shared.exception;

/**
 * Exception ném ra khi dữ liệu customer không hợp lệ
 * VD: CustomerType = COMPANY nhưng thiếu companyName hoặc taxCode
 */
public class InvalidCustomerDataException extends RuntimeException {
    
    public InvalidCustomerDataException(String message) {
        super(message);
    }
    
    public InvalidCustomerDataException(String message, Throwable cause) {
        super(message, cause);
    }
}

package com.example.seatrans.shared.exception;

/**
 * Exception ném ra khi không tìm thấy employee
 */
public class EmployeeNotFoundException extends RuntimeException {
    
    public EmployeeNotFoundException(String message) {
        super(message);
    }
    
    public EmployeeNotFoundException(Long employeeId) {
        super("Employee not found with ID: " + employeeId);
    }
    
    public EmployeeNotFoundException(String field, String value) {
        super(String.format("Employee not found with %s: %s", field, value));
    }
    
    public EmployeeNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}

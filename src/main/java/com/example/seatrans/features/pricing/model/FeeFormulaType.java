package com.example.seatrans.features.pricing.model;

/**
 * Loại công thức tính phí
 */
public enum FeeFormulaType {
    SIMPLE_MULTIPLICATION,  // Phép nhân đơn giản: GRT * rate * days
    BASE_PLUS_VARIABLE,     // Base + biến: base + (GRT * rate)
    PERCENTAGE,             // Phần trăm: value * percentage
    FIXED,                  // Cố định: giá trị không đổi
    CONDITIONAL,            // Có điều kiện: if-then-else
    COMPLEX_FORMULA,        // Công thức phức tạp custom
    TIERED_PRICING         // Giá theo bậc: tier 1, tier 2...
}

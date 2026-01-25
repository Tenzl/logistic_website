package com.example.seatrans.shared.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Currency and money calculation utilities.
 * Policy: USD, 2 decimals, HALF_UP rounding.
 */
public final class Money {

    private Money() {
        throw new UnsupportedOperationException("Utility class");
    }

    /** Standard scale for currency (2 decimals for USD cents). */
    public static final int CURRENCY_SCALE = 2;

    /** Standard scale for rates/coefficients (6 decimals). */
    public static final int RATE_SCALE = 6;

    /** Standard rounding mode (banker's rounding). */
    public static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;

    /** Round to 2 decimals (currency). */
    public static BigDecimal round2(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return value.setScale(CURRENCY_SCALE, ROUNDING_MODE);
    }

    /** Round rate/coefficient to 6 decimals. */
    public static BigDecimal roundRate(BigDecimal rate) {
        if (rate == null) {
            return BigDecimal.ZERO;
        }
        return rate.setScale(RATE_SCALE, ROUNDING_MODE);
    }

    /** Convert Object to BigDecimal safely. */
    public static BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal) {
            return (BigDecimal) value;
        }
        if (value instanceof Number) {
            // Use string constructor to avoid binary floating errors from doubles.
            return new BigDecimal(value.toString());
        }
        if (value instanceof String) {
            try {
                return new BigDecimal((String) value);
            } catch (NumberFormatException e) {
                return BigDecimal.ZERO;
            }
        }
        return BigDecimal.ZERO;
    }

    /** Multiply and round to currency scale. */
    public static BigDecimal multiplyAndRound(BigDecimal a, BigDecimal b) {
        if (a == null || b == null) {
            return BigDecimal.ZERO;
        }
        return round2(a.multiply(b));
    }

    /** Add and round to currency scale. */
    public static BigDecimal sumAndRound(BigDecimal... values) {
        BigDecimal sum = BigDecimal.ZERO;
        if (values != null) {
            for (BigDecimal v : values) {
                if (v != null) {
                    sum = sum.add(v);
                }
            }
        }
        return round2(sum);
    }

    /** Format for display (with thousands separator). */
    public static String format(BigDecimal value) {
        if (value == null) {
            return "0.00";
        }
        return String.format("%,.2f", value);
    }
}

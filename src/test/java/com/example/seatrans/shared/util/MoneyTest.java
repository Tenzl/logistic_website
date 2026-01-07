package com.example.seatrans.shared.util;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

class MoneyTest {

    @Test
    void round2_halfUp_behavior() {
        assertEquals(new BigDecimal("1.01"), Money.round2(new BigDecimal("1.005")));
        assertEquals(new BigDecimal("1.00"), Money.round2(new BigDecimal("1.004")));
        assertEquals(new BigDecimal("1.23"), Money.round2(new BigDecimal("1.234")));
        assertEquals(new BigDecimal("1.24"), Money.round2(new BigDecimal("1.235")));
    }

    @Test
    void toBigDecimal_handles_various_inputs() {
        assertEquals(new BigDecimal("123"), Money.toBigDecimal(123));
        assertEquals(new BigDecimal("123.45"), Money.toBigDecimal(123.45));
        assertEquals(new BigDecimal("100"), Money.toBigDecimal("100"));
        assertEquals(BigDecimal.ZERO, Money.toBigDecimal(null));
        assertEquals(BigDecimal.ZERO, Money.toBigDecimal("invalid"));
    }

    @Test
    void multiplyAndRound_rounds_currency_scale() {
        BigDecimal a = new BigDecimal("0.0034");
        BigDecimal b = new BigDecimal("10000");
        assertEquals(new BigDecimal("34.00"), Money.multiplyAndRound(a, b));
    }

    @Test
    void sumAndRound_sums_and_rounds() {
        BigDecimal a = new BigDecimal("1.111");
        BigDecimal b = new BigDecimal("2.222");
        BigDecimal c = new BigDecimal("3.333");
        assertEquals(new BigDecimal("6.67"), Money.sumAndRound(a, b, c));
    }
}

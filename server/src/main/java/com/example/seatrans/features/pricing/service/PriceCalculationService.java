package com.example.seatrans.features.pricing.service;

import com.example.seatrans.features.logistics.dto.CharteringRequestDTO;
import com.example.seatrans.features.logistics.dto.LogisticsRequestDTO;
import com.example.seatrans.features.logistics.dto.ShippingAgencyRequestDTO;
import com.example.seatrans.features.pricing.model.RateTable;
import com.example.seatrans.features.pricing.repository.RateTableRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

/**
 * CONFIDENTIAL: Price Calculation Service
 * Contains proprietary pricing formulas and business logic
 * TRADE SECRET - Restricted access
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PriceCalculationService {

    private final RateTableRepository rateTableRepository;
    private final ObjectMapper objectMapper;

    private static final String CURRENCY = "USD";
    private static final BigDecimal TAX_RATE = BigDecimal.ZERO; // No tax for now

    /**
     * Calculate price for Freight Forwarding & Logistics service
     * CONFIDENTIAL FORMULA - Internal use only
     */
    public PriceCalculationResult calculateLogisticsPrice(LogisticsRequestDTO request) {
        log.info("Calculating price for Logistics service: {} to {}",
                request.getLoadingPort(), request.getDischargingPort());

        PriceCalculationResult result = PriceCalculationResult.builder()
                .currency(CURRENCY)
                .breakdown(new ArrayList<>())
                .calculationSteps(new ArrayList<>())
                .build();

        BigDecimal basePrice = BigDecimal.ZERO;
        int stepOrder = 1;
        int displayOrder = 1;

        int container20 = request.getContainer20() != null ? request.getContainer20() : 0;
        int container40 = request.getContainer40() != null ? request.getContainer40() : 0;
        int totalContainers = container20 + container40;

        // 1. Ocean Freight
        BigDecimal oceanFreight20 = calculateOceanFreight(
                request.getLoadingPort(), request.getDischargingPort(), "20", container20,
                result, stepOrder++, displayOrder++);
        basePrice = basePrice.add(oceanFreight20);

        BigDecimal oceanFreight40 = calculateOceanFreight(
                request.getLoadingPort(), request.getDischargingPort(), "40", container40,
                result, stepOrder++, displayOrder++);
        basePrice = basePrice.add(oceanFreight40);

        // 2. THC Origin
        BigDecimal thcOrigin = calculateTHC(
                request.getLoadingPort(), "ORIGIN", container20, container40,
                result, stepOrder++, displayOrder++);
        basePrice = basePrice.add(thcOrigin);

        // 3. THC Destination
        BigDecimal thcDest = calculateTHC(
                request.getDischargingPort(), "DESTINATION", container20, container40,
                result, stepOrder++, displayOrder++);
        basePrice = basePrice.add(thcDest);

        // 4. Documentation Fee
        BigDecimal docFee = getRate("FREIGHT_FORWARDING", "DOCUMENTATION", null, null);
        addBreakdownItem(result, "BASE_PRICE", "Documentation Fee", "Per shipment",
                BigDecimal.ONE, docFee, docFee, displayOrder++);
        addCalculationStep(result, "DOCUMENTATION", "Documentation Fee", "FIXED_RATE",
                createInputJson(Map.of("rate", docFee)), null, docFee, null, docFee, stepOrder++);
        basePrice = basePrice.add(docFee);

        // 5. Inland Transport Origin
        BigDecimal inlandOrigin = calculateInlandTransport(
                request.getLoadingPort(), "ORIGIN", container20, container40,
                result, stepOrder++, displayOrder++);
        basePrice = basePrice.add(inlandOrigin);

        // 6. Inland Transport Destination
        BigDecimal inlandDest = calculateInlandTransport(
                request.getDischargingPort(), "DESTINATION", container20, container40,
                result, stepOrder++, displayOrder++);
        basePrice = basePrice.add(inlandDest);

        result.setBasePrice(basePrice);

        // 7. Surcharges
        BigDecimal totalSurcharges = BigDecimal.ZERO;

        // BAF (Bunker Adjustment Factor) - 10% of ocean freight
        BigDecimal oceanFreightTotal = oceanFreight20.add(oceanFreight40);
        BigDecimal baf = oceanFreightTotal.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        addBreakdownItem(result, "SURCHARGE", "BAF (10%)", "Bunker Adjustment Factor",
                BigDecimal.ONE, baf, baf, displayOrder++);
        addCalculationStep(result, "SURCHARGE_BAF", "BAF", "OCEAN_FREIGHT × 0.10",
                createInputJson(Map.of("ocean_freight", oceanFreightTotal, "rate", "0.10")),
                oceanFreightTotal, new BigDecimal("0.10"), null, baf, stepOrder++);
        totalSurcharges = totalSurcharges.add(baf);

        result.setTotalSurcharges(totalSurcharges);

        // 8. Discounts
        BigDecimal totalDiscounts = BigDecimal.ZERO;

        // Volume discount if 5+ containers
        if (totalContainers >= 5) {
            BigDecimal subtotalBeforeDiscount = basePrice.add(totalSurcharges);
            BigDecimal volumeDiscount = subtotalBeforeDiscount.multiply(new BigDecimal("0.05"))
                    .setScale(2, RoundingMode.HALF_UP);
            addBreakdownItem(result, "DISCOUNT", "Volume Discount (5%)",
                    totalContainers + " containers",
                    BigDecimal.ONE, volumeDiscount.negate(), volumeDiscount.negate(), displayOrder++);
            addCalculationStep(result, "DISCOUNT_VOLUME", "Volume Discount",
                    "SUBTOTAL × 0.05",
                    createInputJson(
                            Map.of("subtotal", subtotalBeforeDiscount, "containers", totalContainers, "rate", "0.05")),
                    subtotalBeforeDiscount, new BigDecimal("-0.05"), null, volumeDiscount.negate(), stepOrder++);
            totalDiscounts = totalDiscounts.add(volumeDiscount);
        }

        result.setTotalDiscounts(totalDiscounts);

        // 9. Calculate final amounts
        BigDecimal subtotal = basePrice.add(totalSurcharges).subtract(totalDiscounts);
        result.setSubtotal(subtotal);

        BigDecimal taxAmount = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        result.setTaxAmount(taxAmount);

        BigDecimal finalAmount = subtotal.add(taxAmount);
        result.setFinalAmount(finalAmount);

        log.info("Logistics price calculated: Base={}, Surcharges={}, Discounts={}, Final={}",
                basePrice, totalSurcharges, totalDiscounts, finalAmount);

        return result;
    }

    /**
     * Calculate price for Shipping Agency service
     * CONFIDENTIAL FORMULA - Internal use only
     */
    public PriceCalculationResult calculateShippingAgencyPrice(ShippingAgencyRequestDTO request) {
        log.info("Calculating price for Shipping Agency: DWT={}, GRT={}, LOA={}, Port={}",
                request.getDwt(), request.getGrt(), request.getLoa(), request.getPortOfCall());

        PriceCalculationResult result = PriceCalculationResult.builder()
                .currency(CURRENCY)
                .breakdown(new ArrayList<>())
                .calculationSteps(new ArrayList<>())
                .build();

        BigDecimal basePrice = BigDecimal.ZERO;
        int stepOrder = 1;
        int displayOrder = 1;

        // 1. Port Dues (based on GRT)
        BigDecimal portDuesBaseRate = getRate("SHIPPING_AGENCY", "PORT_DUES", null, null);
        BigDecimal grtFactor = calculateGRTFactor(request.getGrt());
        BigDecimal portDues = portDuesBaseRate.multiply(grtFactor).setScale(2, RoundingMode.HALF_UP);

        addBreakdownItem(result, "BASE_PRICE", "Port Dues",
                String.format("GRT %d × Factor %.2f", request.getGrt(), grtFactor),
                BigDecimal.ONE, portDues, portDues, displayOrder++);
        addCalculationStep(result, "PORT_DUES", "Port Dues",
                "BASE_RATE × GRT_FACTOR",
                createInputJson(Map.of("base_rate", portDuesBaseRate, "grt", request.getGrt(), "factor", grtFactor)),
                portDuesBaseRate, grtFactor, null, portDues, stepOrder++);
        basePrice = basePrice.add(portDues);

        // 2. Agency Fee (based on DWT)
        BigDecimal agencyFeeBaseRate = getRate("SHIPPING_AGENCY", "AGENCY_FEE", null, null);
        BigDecimal dwtFactor = calculateDWTFactor(request.getDwt());
        BigDecimal agencyFee = agencyFeeBaseRate.multiply(dwtFactor).setScale(2, RoundingMode.HALF_UP);

        addBreakdownItem(result, "BASE_PRICE", "Agency Fee",
                String.format("DWT %d × Factor %.2f", request.getDwt(), dwtFactor),
                BigDecimal.ONE, agencyFee, agencyFee, displayOrder++);
        addCalculationStep(result, "AGENCY_FEE", "Agency Fee",
                "BASE_RATE × DWT_FACTOR",
                createInputJson(Map.of("base_rate", agencyFeeBaseRate, "dwt", request.getDwt(), "factor", dwtFactor)),
                agencyFeeBaseRate, dwtFactor, null, agencyFee, stepOrder++);
        basePrice = basePrice.add(agencyFee);

        // 3. Pilotage (based on LOA)
        BigDecimal pilotageBaseRate = getRate("SHIPPING_AGENCY", "PILOTAGE", null, null);
        BigDecimal loaFactor = calculateLOAFactor(request.getLoa());
        BigDecimal pilotage = pilotageBaseRate.multiply(loaFactor).setScale(2, RoundingMode.HALF_UP);

        addBreakdownItem(result, "BASE_PRICE", "Pilotage Service",
                String.format("LOA %.1fm × Factor %.2f", request.getLoa(), loaFactor),
                BigDecimal.ONE, pilotage, pilotage, displayOrder++);
        addCalculationStep(result, "PILOTAGE", "Pilotage",
                "BASE_RATE × LOA_FACTOR",
                createInputJson(Map.of("base_rate", pilotageBaseRate, "loa", request.getLoa(), "factor", loaFactor)),
                pilotageBaseRate, loaFactor, null, pilotage, stepOrder++);
        basePrice = basePrice.add(pilotage);

        result.setBasePrice(basePrice);
        result.setTotalSurcharges(BigDecimal.ZERO);
        result.setTotalDiscounts(BigDecimal.ZERO);
        result.setSubtotal(basePrice);
        result.setTaxAmount(BigDecimal.ZERO);
        result.setFinalAmount(basePrice);

        log.info("Shipping Agency price calculated: Final={}", basePrice);

        return result;
    }

    /**
     * Calculate price for Chartering service
     * CONFIDENTIAL FORMULA - Internal use only
     */
    public PriceCalculationResult calculateCharteringPrice(CharteringRequestDTO request) {
        log.info("Calculating price for Chartering: {} to {}, Type={}",
                request.getLoadingPort(), request.getDischargingPort(), request.getCharterType());

        PriceCalculationResult result = PriceCalculationResult.builder()
                .currency(CURRENCY)
                .breakdown(new ArrayList<>())
                .calculationSteps(new ArrayList<>())
                .build();

        BigDecimal basePrice = BigDecimal.ZERO;
        int stepOrder = 1;
        int displayOrder = 1;

        // 1. Voyage Charter Base Rate
        BigDecimal voyageRate = getRate("CHARTERING", "VOYAGE_CHARTER",
                request.getLoadingPort(), request.getDischargingPort());

        addBreakdownItem(result, "BASE_PRICE", "Voyage Charter",
                String.format("%s to %s", request.getLoadingPort(), request.getDischargingPort()),
                BigDecimal.ONE, voyageRate, voyageRate, displayOrder++);
        addCalculationStep(result, "VOYAGE_CHARTER", "Voyage Charter Rate",
                "ROUTE_BASE_RATE",
                createInputJson(Map.of("from", request.getLoadingPort(), "to", request.getDischargingPort(), "rate",
                        voyageRate)),
                voyageRate, BigDecimal.ONE, null, voyageRate, stepOrder++);
        basePrice = basePrice.add(voyageRate);

        // 2. Brokerage Fee (2.5% of voyage charter)
        BigDecimal brokerageRate = new BigDecimal("0.025");
        BigDecimal brokerage = voyageRate.multiply(brokerageRate).setScale(2, RoundingMode.HALF_UP);

        addBreakdownItem(result, "BASE_PRICE", "Brokerage Fee",
                "2.5% of voyage charter",
                BigDecimal.ONE, brokerage, brokerage, displayOrder++);
        addCalculationStep(result, "BROKERAGE", "Brokerage Fee",
                "VOYAGE_RATE × 0.025",
                createInputJson(Map.of("voyage_rate", voyageRate, "rate", "0.025")),
                voyageRate, brokerageRate, null, brokerage, stepOrder++);
        basePrice = basePrice.add(brokerage);

        result.setBasePrice(basePrice);
        result.setTotalSurcharges(BigDecimal.ZERO);
        result.setTotalDiscounts(BigDecimal.ZERO);
        result.setSubtotal(basePrice);
        result.setTaxAmount(BigDecimal.ZERO);
        result.setFinalAmount(basePrice);

        log.info("Chartering price calculated: Final={}", basePrice);

        return result;
    }

    // ========== PRIVATE HELPER METHODS (CONFIDENTIAL) ==========

    private BigDecimal calculateOceanFreight(String from, String to, String containerSize,
            int quantity, PriceCalculationResult result,
            int stepOrder, int displayOrder) {
        if (quantity == 0)
            return BigDecimal.ZERO;

        BigDecimal rate = getRate("FREIGHT_FORWARDING", "OCEAN_FREIGHT", from, to, containerSize);
        BigDecimal total = rate.multiply(new BigDecimal(quantity));

        addBreakdownItem(result, "BASE_PRICE", "Ocean Freight " + containerSize + "ft",
                String.format("%s to %s", from, to), new BigDecimal(quantity), rate, total, displayOrder);
        addCalculationStep(result, "OCEAN_FREIGHT_" + containerSize,
                "Container " + containerSize + "ft Rate",
                "RATE_" + containerSize + " × QTY_" + containerSize,
                createInputJson(Map.of("route", from + "-" + to, "rate", rate, "qty", quantity)),
                rate, new BigDecimal(quantity), null, total, stepOrder);

        return total;
    }

    private BigDecimal calculateTHC(String location, String direction, int qty20, int qty40,
            PriceCalculationResult result, int stepOrder, int displayOrder) {
        BigDecimal rate20 = getRate("FREIGHT_FORWARDING", "THC", location, direction, "20");
        BigDecimal rate40 = getRate("FREIGHT_FORWARDING", "THC", location, direction, "40");

        BigDecimal total20 = rate20.multiply(new BigDecimal(qty20));
        BigDecimal total40 = rate40.multiply(new BigDecimal(qty40));
        BigDecimal total = total20.add(total40);

        if (total.compareTo(BigDecimal.ZERO) > 0) {
            addBreakdownItem(result, "BASE_PRICE", "THC " + direction,
                    String.format("%s (%d×20' + %d×40')", location, qty20, qty40),
                    new BigDecimal(qty20 + qty40), null, total, displayOrder);
            addCalculationStep(result, "THC_" + direction, "THC " + location,
                    "THC_20 × QTY_20 + THC_40 × QTY_40",
                    createInputJson(Map.of("location", location, "thc_20", rate20, "qty_20", qty20, "thc_40", rate40,
                            "qty_40", qty40)),
                    null, null, null, total, stepOrder);
        }

        return total;
    }

    private BigDecimal calculateInlandTransport(String location, String direction, int qty20, int qty40,
            PriceCalculationResult result, int stepOrder, int displayOrder) {
        BigDecimal rate20 = getRate("FREIGHT_FORWARDING", "INLAND_TRANSPORT", location, direction, "20");
        BigDecimal rate40 = getRate("FREIGHT_FORWARDING", "INLAND_TRANSPORT", location, direction, "40");

        BigDecimal total20 = rate20.multiply(new BigDecimal(qty20));
        BigDecimal total40 = rate40.multiply(new BigDecimal(qty40));
        BigDecimal total = total20.add(total40);

        if (total.compareTo(BigDecimal.ZERO) > 0) {
            addBreakdownItem(result, "BASE_PRICE", "Inland Transport " + direction,
                    String.format("%s (%d×20' + %d×40')", location, qty20, qty40),
                    new BigDecimal(qty20 + qty40), null, total, displayOrder);
            addCalculationStep(result, "INLAND_" + direction, "Inland " + location,
                    "INLAND_20 × QTY_20 + INLAND_40 × QTY_40",
                    createInputJson(Map.of("location", location, "inland_20", rate20, "qty_20", qty20, "inland_40",
                            rate40, "qty_40", qty40)),
                    null, null, null, total, stepOrder);
        }

        return total;
    }

    private BigDecimal getRate(String serviceType, String category, String from, String to) {
        return getRate(serviceType, category, from, to, null);
    }

    private BigDecimal getDefaultRate(String serviceType, String category, String size) {
        // Default fallback rates
        if ("FREIGHT_FORWARDING".equals(serviceType)) {
            if ("OCEAN_FREIGHT".equals(category)) {
                return "20".equals(size) ? new BigDecimal("300") : new BigDecimal("500");
            } else if ("THC".equals(category)) {
                return "20".equals(size) ? new BigDecimal("80") : new BigDecimal("120");
            } else if ("INLAND_TRANSPORT".equals(category)) {
                return "20".equals(size) ? new BigDecimal("80") : new BigDecimal("100");
            } else if ("DOCUMENTATION".equals(category)) {
                return new BigDecimal("230");
            }
        } else if ("SHIPPING_AGENCY".equals(serviceType)) {
            if ("PORT_DUES".equals(category))
                return new BigDecimal("500");
            if ("AGENCY_FEE".equals(category))
                return new BigDecimal("800");
            if ("PILOTAGE".equals(category))
                return new BigDecimal("300");
        } else if ("CHARTERING".equals(serviceType)) {
            if ("VOYAGE_CHARTER".equals(category))
                return new BigDecimal("15000");
            if ("BROKERAGE".equals(category))
                return new BigDecimal("2.5");
        }

        return new BigDecimal("100"); // Ultimate fallback
    }

    private BigDecimal calculateGRTFactor(Integer grt) {
        if (grt < 1000)
            return new BigDecimal("0.5");
        if (grt < 5000)
            return BigDecimal.ONE;
        if (grt < 10000)
            return new BigDecimal("1.5");
        if (grt < 50000)
            return new BigDecimal("2.0");
        return new BigDecimal("3.0");
    }

    private BigDecimal calculateDWTFactor(Integer dwt) {
        if (dwt < 5000)
            return BigDecimal.ONE;
        if (dwt < 10000)
            return new BigDecimal("1.2");
        if (dwt < 50000)
            return new BigDecimal("1.5");
        if (dwt < 100000)
            return new BigDecimal("2.0");
        return new BigDecimal("2.5");
    }

    private BigDecimal calculateLOAFactor(Double loa) {
        if (loa < 100)
            return BigDecimal.ONE;
        if (loa < 150)
            return new BigDecimal("1.3");
        if (loa < 200)
            return new BigDecimal("1.6");
        if (loa < 300)
            return new BigDecimal("2.0");
        return new BigDecimal("2.5");
    }

    private void addBreakdownItem(PriceCalculationResult result, String category, String name,
            String description, BigDecimal quantity, BigDecimal unitPrice,
            BigDecimal totalPrice, int displayOrder) {
        result.getBreakdown().add(PriceCalculationResult.PriceBreakdownItem.builder()
                .itemCategory(category)
                .itemName(name)
                .description(description)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .totalPrice(totalPrice)
                .displayOrder(displayOrder)
                .build());
    }

    private void addCalculationStep(PriceCalculationResult result, String step, String component,
            String formula, String inputJson, BigDecimal baseValue,
            BigDecimal rate, BigDecimal multiplier, BigDecimal calculated,
            int stepOrder) {
        result.getCalculationSteps().add(PriceCalculationResult.CalculationStep.builder()
                .calculationStep(step)
                .componentName(component)
                .formulaUsed(formula)
                .inputValues(inputJson)
                .baseValue(baseValue)
                .rateApplied(rate)
                .multiplier(multiplier)
                .calculatedValue(calculated)
                .stepOrder(stepOrder)
                .build());
    }

    private String createInputJson(Map<String, Object> data) {
        try {
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            log.error("Failed to create input JSON", e);
            return "{}";
        }
    }
}

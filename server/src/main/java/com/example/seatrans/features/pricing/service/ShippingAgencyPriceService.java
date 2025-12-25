package com.example.seatrans.features.pricing.service;

import com.example.seatrans.features.logistics.dto.ShippingAgencyRequestDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Shipping Agency Price Calculation Service
 * Based on actual port disbursement account calculation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ShippingAgencyPriceService {
    
    private static final String CURRENCY = "USD";
    private static final String PORT_HAIPHONG = "HAIPHONG";
    private static final String PORT_HOCHIMINH = "HOCHIMINH";
    
    public ShippingAgencyPriceResult calculatePrice(ShippingAgencyRequestDTO request) {
        log.info("Calculating Shipping Agency price for {} at port {}", 
            request.getDwt(), request.getPortOfCall());
        
        String port = request.getPortOfCall().toUpperCase();
        int dwt = request.getDwt();
        int grt = request.getGrt();
        double loa = request.getLoa();
        long stayDays = ChronoUnit.DAYS.between(request.getArrivalDate(), request.getDepartureDate());
        if (stayDays <= 0) stayDays = 1;
        long stayHours = stayDays * 24;
        
        List<ShippingAgencyPriceResult.PriceComponent> components = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        
        // 1. Tonnage Fee
        BigDecimal tonnageFee = calculateTonnageFee(grt, port, stayDays);
        components.add(createComponent("Tonnage Fee", tonnageFee, 
            String.format("GRT %d × Rate × %d days", grt, stayDays)));
        total = total.add(tonnageFee);
        
        // 2. Navigation Due
        BigDecimal navigationDue = calculateNavigationDue(grt, port);
        components.add(createComponent("Navigation Due", navigationDue, 
            String.format("GRT %d × Rate", grt)));
        total = total.add(navigationDue);
        
        // 3. Pilotage
        BigDecimal pilotage = calculatePilotage(grt, port);
        components.add(createComponent("Pilotage", pilotage, 
            String.format("Base + (GRT %d × Rate) + Distance", grt)));
        total = total.add(pilotage);
        
        // 4. Tug Assistance
        BigDecimal tugAssistance = calculateTugAssistance(loa, dwt, port);
        components.add(createComponent("Tug Assistance Charge", tugAssistance, 
            String.format("%.0fm LOA → %d tugs × 2 operations", loa, getNumberOfTugs(loa, dwt))));
        total = total.add(tugAssistance);
        
        // 5. Moor/Unmoor
        BigDecimal moorUnmoor = calculateMoorUnmoor(loa, port);
        components.add(createComponent("Moor/Unmooring Charge", moorUnmoor, 
            String.format("%.0fm LOA × 2 operations", loa)));
        total = total.add(moorUnmoor);
        
        // 6. Berth Due
        BigDecimal berthDue = calculateBerthDue(dwt, port, stayHours);
        components.add(createComponent("Berth Due", berthDue, 
            String.format("DWT %d × Rate × %d hours", dwt, stayHours)));
        total = total.add(berthDue);
        
        // 7. Anchorage Fees (if any) - default 0
        BigDecimal anchorageFees = BigDecimal.ZERO;
        components.add(createComponent("Anchorage Fees", anchorageFees, "No waiting time"));
        
        // 8. Quarantine Fee
        BigDecimal quarantineFee = calculateQuarantineFee(dwt, port);
        components.add(createComponent("Quarantine Fee", quarantineFee, 
            String.format("Base + %d crew", getEstimatedCrew(dwt))));
        total = total.add(quarantineFee);
        
        // 9. Ocean Freight Tax
        BigDecimal baseFees = tonnageFee.add(navigationDue).add(berthDue);
        BigDecimal oceanFrtTax = baseFees.multiply(BigDecimal.valueOf(0.05))
            .setScale(2, RoundingMode.HALF_UP);
        components.add(createComponent("Ocean Freight Tax", oceanFrtTax, "5% of base fees"));
        total = total.add(oceanFrtTax);
        
        // 10. Transport for Quarantine
        BigDecimal transportQuarantine = port.equals(PORT_HAIPHONG) 
            ? BigDecimal.valueOf(150) : BigDecimal.valueOf(200);
        components.add(createComponent("Transport for Entry Quarantine Formality", 
            transportQuarantine, "Fixed fee"));
        total = total.add(transportQuarantine);
        
        // 11. Berthing B.4 Application (if DWT exceeds limit)
        BigDecimal berthingB4 = calculateBerthingB4(dwt, port);
        if (berthingB4.compareTo(BigDecimal.ZERO) > 0) {
            int limit = port.equals(PORT_HAIPHONG) ? 30000 : 40000;
            components.add(createComponent("Berthing Application to B.4 (Over DWT)", 
                berthingB4, String.format("DWT exceeds %d limit", limit)));
            total = total.add(berthingB4);
        } else {
            components.add(createComponent("Berthing Application to B.4 (Over DWT)", 
                BigDecimal.ZERO, "Within limit"));
        }
        
        // 12. Clearance Fees
        BigDecimal clearanceFees = port.equals(PORT_HAIPHONG) 
            ? BigDecimal.valueOf(530) : BigDecimal.valueOf(650);
        components.add(createComponent("Clearance Fees", clearanceFees, 
            "Customs + Immigration + Port Authority + Certificates"));
        total = total.add(clearanceFees);
        
        // 13. Garbage Removal Fee
        BigDecimal garbageFee = calculateGarbageFee(port, stayDays);
        components.add(createComponent("Garbage Removal Fee", garbageFee, 
            String.format("Base + %d days", stayDays)));
        total = total.add(garbageFee);
        
        return ShippingAgencyPriceResult.builder()
            .components(components)
            .totalAmount(total.setScale(2, RoundingMode.HALF_UP))
            .currency(CURRENCY)
            .port(port)
            .dwt(dwt)
            .grt(grt)
            .loa(loa)
            .stayDays((int) stayDays)
            .arrivalDate(request.getArrivalDate())
            .departureDate(request.getDepartureDate())
            .build();
    }
    
    private BigDecimal calculateTonnageFee(int grt, String port, long days) {
        double rate = port.equals(PORT_HAIPHONG) ? 0.025 : 0.028;
        return BigDecimal.valueOf(grt)
            .multiply(BigDecimal.valueOf(rate))
            .multiply(BigDecimal.valueOf(days))
            .setScale(2, RoundingMode.HALF_UP);
    }
    
    private BigDecimal calculateNavigationDue(int grt, String port) {
        double rate = port.equals(PORT_HAIPHONG) ? 0.12 : 0.15;
        return BigDecimal.valueOf(grt)
            .multiply(BigDecimal.valueOf(rate))
            .setScale(2, RoundingMode.HALF_UP);
    }
    
    private BigDecimal calculatePilotage(int grt, String port) {
        double baseFee = port.equals(PORT_HAIPHONG) ? 400 : 500;
        double pilotageRate = getPilotageRate(grt);
        double distance = port.equals(PORT_HAIPHONG) ? 20 : 30; // nautical miles
        
        return BigDecimal.valueOf(baseFee)
            .add(BigDecimal.valueOf(grt).multiply(BigDecimal.valueOf(pilotageRate)))
            .add(BigDecimal.valueOf(distance * 50))
            .setScale(2, RoundingMode.HALF_UP);
    }
    
    private double getPilotageRate(int grt) {
        if (grt <= 10000) return 0.08;
        if (grt <= 30000) return 0.10;
        if (grt <= 50000) return 0.12;
        return 0.15;
    }
    
    private BigDecimal calculateTugAssistance(double loa, int dwt, String port) {
        int tugs = getNumberOfTugs(loa, dwt);
        double tugRate = port.equals(PORT_HAIPHONG) ? 350 : 450;
        double hours = 2.5;
        int operations = 2; // arrival + departure
        
        return BigDecimal.valueOf(tugs)
            .multiply(BigDecimal.valueOf(tugRate))
            .multiply(BigDecimal.valueOf(hours))
            .multiply(BigDecimal.valueOf(operations))
            .setScale(2, RoundingMode.HALF_UP);
    }
    
    private int getNumberOfTugs(double loa, int dwt) {
        if (loa < 100) return 1;
        if (loa < 150) return dwt < 20000 ? 2 : 3;
        if (loa < 200) return dwt < 30000 ? 2 : 3;
        if (loa < 250) return 3;
        return 4;
    }
    
    private BigDecimal calculateMoorUnmoor(double loa, String port) {
        double baseFee = port.equals(PORT_HAIPHONG) ? 200 : 250;
        double loaRate = port.equals(PORT_HAIPHONG) ? 3.0 : 3.5;
        
        BigDecimal singleOperation = BigDecimal.valueOf(baseFee)
            .add(BigDecimal.valueOf(loa).multiply(BigDecimal.valueOf(loaRate)));
        
        return singleOperation.multiply(BigDecimal.valueOf(2)) // moor + unmoor
            .setScale(2, RoundingMode.HALF_UP);
    }
    
    private BigDecimal calculateBerthDue(int dwt, String port, long hours) {
        double rate = port.equals(PORT_HAIPHONG) ? 0.018 : 0.022;
        return BigDecimal.valueOf(dwt)
            .multiply(BigDecimal.valueOf(rate))
            .multiply(BigDecimal.valueOf(hours))
            .setScale(2, RoundingMode.HALF_UP);
    }
    
    private BigDecimal calculateQuarantineFee(int dwt, String port) {
        double baseFee = port.equals(PORT_HAIPHONG) ? 300 : 350;
        double crewFee = port.equals(PORT_HAIPHONG) ? 25 : 30;
        int crew = getEstimatedCrew(dwt);
        
        return BigDecimal.valueOf(baseFee)
            .add(BigDecimal.valueOf(crew).multiply(BigDecimal.valueOf(crewFee)))
            .setScale(2, RoundingMode.HALF_UP);
    }
    
    private int getEstimatedCrew(int dwt) {
        if (dwt < 10000) return 15;
        if (dwt <= 30000) return 20;
        if (dwt <= 50000) return 25;
        return 30;
    }
    
    private BigDecimal calculateBerthingB4(int dwt, String port) {
        int limit = port.equals(PORT_HAIPHONG) ? 30000 : 40000;
        if (dwt <= limit) return BigDecimal.ZERO;
        
        double fixedFee = port.equals(PORT_HAIPHONG) ? 500 : 600;
        double excessRate = port.equals(PORT_HAIPHONG) ? 0.05 : 0.06;
        int excess = dwt - limit;
        
        return BigDecimal.valueOf(fixedFee)
            .add(BigDecimal.valueOf(excess).multiply(BigDecimal.valueOf(excessRate)))
            .setScale(2, RoundingMode.HALF_UP);
    }
    
    private BigDecimal calculateGarbageFee(String port, long days) {
        double baseFee = port.equals(PORT_HAIPHONG) ? 150 : 180;
        double dailyFee = port.equals(PORT_HAIPHONG) ? 30 : 35;
        
        return BigDecimal.valueOf(baseFee)
            .add(BigDecimal.valueOf(days).multiply(BigDecimal.valueOf(dailyFee)))
            .setScale(2, RoundingMode.HALF_UP);
    }
    
    private ShippingAgencyPriceResult.PriceComponent createComponent(
            String name, BigDecimal amount, String description) {
        return ShippingAgencyPriceResult.PriceComponent.builder()
            .name(name)
            .amount(amount)
            .description(description)
            .build();
    }
}

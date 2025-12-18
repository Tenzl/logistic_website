# Pricing & Quotation Slice

## Description
Handles fee configurations, price calculations, and quotation generation.

## Files to Move

### Controllers
- `src/main/java/com/example/seatrans/controller/FeeConfigurationController.java`
- `src/main/java/com/example/seatrans/controller/PublicCalculatorController.java`
- `src/main/java/com/example/seatrans/controller/EmployeeQuotationController.java`

### Services
- `src/main/java/com/example/seatrans/service/FeeConfigurationService.java`
- `src/main/java/com/example/seatrans/service/QuotationService.java`
- `src/main/java/com/example/seatrans/service/pricing/*`

### Entities
- `src/main/java/com/example/seatrans/entity/PricingManagement/*`
- `src/main/java/com/example/seatrans/entity/Quotation.java`
- `src/main/java/com/example/seatrans/entity/QuotationItem.java`
- `src/main/java/com/example/seatrans/entity/PriceCalculation.java`
- `src/main/java/com/example/seatrans/entity/RateTable.java`
- `src/main/java/com/example/seatrans/entity/SavedEstimate.java`

### Repositories
- `src/main/java/com/example/seatrans/repository/FeeConfigurationRepository.java`
- `src/main/java/com/example/seatrans/repository/QuotationRepository.java`

### DTOs
- Related DTOs for Pricing and Quotations

## New Location
`src/main/java/com/example/seatrans/features/pricing/`

# Shared Kernel

## Description
Contains common code, utilities, configurations, and cross-cutting concerns that are used by multiple slices.

## Files to Move

### Configuration
- `src/main/java/com/example/seatrans/config/SecurityConfig.java` (Essential for Auth & CORS)
- `src/main/java/com/example/seatrans/config/WebMvcConfig.java` (Essential for serving uploaded images)

### Security
- `src/main/java/com/example/seatrans/security/*`
- `src/main/java/com/example/seatrans/filter/*`

### Exceptions
- `src/main/java/com/example/seatrans/exception/*`

### Utilities
- `src/main/java/com/example/seatrans/util/*`

### Mappers
- `src/main/java/com/example/seatrans/mapper/*` (Unless specific to a slice, then move to slice)

### Common DTOs
- `src/main/java/com/example/seatrans/dto/ApiResponse.java` (or similar common wrappers)

## New Location
`src/main/java/com/example/seatrans/shared/`

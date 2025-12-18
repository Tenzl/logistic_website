# Authentication & User Management Slice

## Description
Handles user registration, login, role management, and profile updates.

## Files to Move

### Controllers
- `src/main/java/com/example/seatrans/controller/AuthController.java`
- `src/main/java/com/example/seatrans/controller/UserController.java`
- `src/main/java/com/example/seatrans/controller/EmployeeController.java`

### Services
- `src/main/java/com/example/seatrans/service/UserService.java`
- `src/main/java/com/example/seatrans/service/EmployeeService.java`
- `src/main/java/com/example/seatrans/service/RoleValidationService.java`

### Entities
- `src/main/java/com/example/seatrans/entity/UserManagement/*` (User, Role, etc.)

### Repositories
- `src/main/java/com/example/seatrans/repository/UserRepository.java`
- `src/main/java/com/example/seatrans/repository/RoleRepository.java` (if exists)

### DTOs
- `src/main/java/com/example/seatrans/dto/AuthRequest.java`
- `src/main/java/com/example/seatrans/dto/AuthResponse.java`
- `src/main/java/com/example/seatrans/dto/UserDTO.java`
- `src/main/java/com/example/seatrans/dto/RegisterRequest.java`

## New Location
`src/main/java/com/example/seatrans/features/auth/`

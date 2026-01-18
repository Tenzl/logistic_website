# Spring Boot Architecture - Layered Architecture Pattern

## Tổng quan

Dự án Seatrans sử dụng **Layered Architecture** (Kiến trúc phân lớp) với 5 thành phần chính:

```
Client Request
     ↓
Controller Layer (API Endpoints)
     ↓
Service Layer (Business Logic)
     ↓
Repository Layer (Database Access)
     ↓
Database
     ↑
Model Layer (Entity)
     ↓
DTO Layer (Data Transfer)
     ↓
Client Response
```

---

## 1. Model (Entity Layer)

### Vai trò
- Đại diện cho **bảng trong database**
- Chứa cấu trúc dữ liệu và quan hệ giữa các bảng
- Được ánh xạ (mapping) với database thông qua **JPA/Hibernate**

### Đặc điểm
- Dùng các annotation: `@Entity`, `@Table`, `@Id`, `@Column`
- Định nghĩa quan hệ: `@ManyToOne`, `@OneToMany`, `@ManyToMany`
- **KHÔNG** chứa business logic

### Ví dụ: User Entity

```java
@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;  // Quan hệ N-1 với Role
    
    // Getters, setters...
}
```

**Vị trí**: `src/main/java/com/example/seatrans/features/auth/model/User.java`

---

## 2. DTO (Data Transfer Object)

### Vai trò
- **Truyền dữ liệu** giữa các layer (đặc biệt từ Service → Controller → Client)
- Che giấu thông tin nhạy cảm (ví dụ: không trả về password)
- **Validate** dữ liệu đầu vào từ client
- Giảm coupling giữa client và database structure

### Đặc điểm
- Dùng annotation validation: `@NotBlank`, `@Email`, `@Size`, `@Pattern`
- Thường dùng Lombok: `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`
- **KHÔNG** có business logic

### Ví dụ: UserDTO (Response)

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String company;
    private Boolean isActive;
    private Long roleId;
    private String role;        // Role name
    private String roleGroup;   // INTERNAL/EXTERNAL
    // Không có password!
}
```

### Ví dụ: RegisterDTO (Request)

```java
@Data
@Builder
public class RegisterDTO {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$")
    private String password;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    private String phone;
    private String company;
}
```

**Vị trí**: `src/main/java/com/example/seatrans/features/auth/dto/`

---

## 3. Repository Layer

### Vai trò
- **Truy cập database** - CRUD operations
- Chứa các query methods tùy chỉnh
- Interface kế thừa `JpaRepository<Entity, ID>`

### Đặc điểm
- Spring Data JPA tự động generate implementation
- Có thể dùng:
  - Method naming convention: `findByEmail`, `findByRoleGroup`
  - `@Query` với JPQL/SQL
- **KHÔNG** chứa business logic

### Ví dụ: UserRepository

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Method naming convention - Spring tự generate query
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByIsActiveTrue();
    
    // Custom JPQL query
    @Query("SELECT u FROM User u WHERE u.role.name = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);
    
    @Query("SELECT u FROM User u WHERE u.role.roleGroup = :roleGroup")
    List<User> findByRoleGroup(@Param("roleGroup") RoleGroup roleGroup);
    
    // Native SQL query
    @Query(value = "SELECT COUNT(*) FROM users WHERE role_id = ?1", nativeQuery = true)
    Long countByRoleId(Long roleId);
}
```

**Vị trí**: `src/main/java/com/example/seatrans/features/auth/repository/UserRepository.java`

---

## 4. Service Layer

### Vai trò
- Chứa **business logic** của ứng dụng
- Xử lý nghiệp vụ, validate business rules
- Gọi Repository để thao tác với database
- **Transaction management** (`@Transactional`)

### Đặc điểm
- Annotation: `@Service`, `@Transactional`
- Inject Repository qua constructor: `@RequiredArgsConstructor` (Lombok)
- Có thể gọi nhiều Repository hoặc Service khác
- Throw custom exceptions khi có lỗi nghiệp vụ

### Ví dụ: UserService

```java
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleValidationService roleValidationService;

    // Business logic: Create user
    public User createUser(User user) {
        // 1. Validate email format
        validateEmail(user.getEmail());
        
        // 2. Check duplicate
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new DuplicateUserException("Email", user.getEmail());
        }
        
        // 3. Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // 4. Validate role
        if (user.getRole() != null) {
            roleValidationService.validateUserRole(user);
        }
        
        // 5. Save to database
        return userRepository.save(user);
    }
    
    // Business logic: Register customer
    public User registerOrUpgradeCustomer(RegisterDTO dto) {
        validateEmail(dto.getEmail());
        
        Optional<User> existingByEmail = userRepository.findByEmail(dto.getEmail());
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new RoleNotFoundException("name", "ROLE_CUSTOMER"));
        
        if (existingByEmail.isPresent()) {
            User existing = existingByEmail.get();
            boolean isGuest = existing.getRole() != null 
                    && "ROLE_GUEST".equals(existing.getRole().getName());
            
            if (!isGuest) {
                throw new DuplicateUserException("Email", dto.getEmail());
            }
            
            // Upgrade guest to customer
            existing.setFullName(dto.getFullName());
            existing.setPhone(dto.getPhone());
            existing.setCompany(dto.getCompany());
            existing.setPassword(passwordEncoder.encode(dto.getPassword()));
            existing.setRole(customerRole);
            return userRepository.save(existing);
        }
        
        // Create new customer
        User user = new User(dto.getEmail(), passwordEncoder.encode(dto.getPassword()));
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setCompany(dto.getCompany());
        user.setRole(customerRole);
        return userRepository.save(user);
    }
    
    // Read operation
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
    }
    
    // Update operation
    public User assignRole(Long userId, String roleName) {
        User user = getUserById(userId);
        Role role = roleRepository.findByName(roleName)
            .orElseThrow(() -> new RoleNotFoundException("name", roleName));
        
        roleValidationService.validateRoleAssignment(user, role);
        user.setRole(role);
        return userRepository.save(user);
    }
}
```

**Vị trí**: `src/main/java/com/example/seatrans/features/auth/service/UserService.java`

---

## 5. Controller Layer

### Vai trò
- **API endpoints** - nhận HTTP requests từ client
- Validate request payload (dùng `@Valid`)
- Gọi Service để xử lý nghiệp vụ
- Trả về HTTP response (JSON)
- **Authorization** - kiểm tra quyền truy cập

### Đặc điểm
- Annotation: `@RestController`, `@RequestMapping`
- Mapping methods: `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`
- Authorization: `@PreAuthorize("hasAuthority('ROLE_ADMIN')")`
- Dependency injection: inject Service

### Ví dụ: UserController

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    private final EntityMapper entityMapper;
    
    /**
     * GET /api/users
     * Lấy tất cả users - chỉ ADMIN
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserDTO> userDTOs = users.stream()
                .map(entityMapper::toUserDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(userDTOs));
    }
    
    /**
     * GET /api/users/{id}
     * Lấy user theo ID
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success(userDTO));
    }
    
    /**
     * POST /api/users/{id}/roles
     * Gán role cho user - chỉ ADMIN
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/{id}/roles")
    public ResponseEntity<ApiResponse<UserDTO>> assignRole(
            @PathVariable Long id,
            @RequestParam String roleName) {
        
        User user = userService.assignRole(id, roleName);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success("Role assigned successfully", userDTO));
    }
    
    /**
     * PUT /api/users/{id}
     * Update user - ADMIN hoặc chính user đó
     */
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable Long id, 
            @RequestBody User updatedUser, 
            HttpServletRequest request) {
        
        // Check authorization
        Long requestUserId = (Long) request.getAttribute("userId");
        boolean isAdmin = request.isUserInRole("ROLE_ADMIN");
        
        if (!isAdmin && !id.equals(requestUserId)) {
            return ResponseEntity.status(403)
                .body(ApiResponse.error("Access denied"));
        }
        
        User user = userService.updateUser(id, updatedUser);
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", userDTO));
    }
}
```

**Vị trí**: `src/main/java/com/example/seatrans/features/auth/controller/UserController.java`

---

## Luồng dữ liệu hoàn chỉnh

### Ví dụ: Đăng ký user mới

#### 1. Client gửi request

```http
POST /api/auth/register/customer
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "phone": "0123456789",
  "company": "ABC Corp"
}
```

#### 2. Controller nhận request

```java
// AuthController.java
@PostMapping("/register/customer")
public ResponseEntity<ApiResponse<AuthResponseDTO>> registerCustomer(
        @Valid @RequestBody RegisterDTO registerDTO) {
    
    // DTO đã được validate bởi @Valid
    AuthResponseDTO response = authService.register(registerDTO);
    return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
}
```

**Nhiệm vụ Controller:**
- Nhận HTTP request
- Validate DTO với `@Valid` (email format, password strength, etc.)
- Gọi AuthService để xử lý
- Trả về response dạng JSON

#### 3. Service xử lý business logic

```java
// AuthServiceImpl.java
@Override
public AuthResponseDTO register(RegisterDTO registerDTO) {
    // Gọi UserService để tạo user
    User createdUser = userService.registerOrUpgradeCustomer(registerDTO);
    
    // Map Entity -> DTO
    UserDTO userDTO = entityMapper.toUserDTO(createdUser);
    
    // Generate JWT token
    String token = tokenProvider.generateToken(createdUser);
    String refreshToken = tokenProvider.generateRefreshToken(createdUser);
    
    // Return response
    return AuthResponseDTO.builder()
            .token(token)
            .refreshToken(refreshToken)
            .type("Bearer")
            .user(userDTO)
            .build();
}
```

```java
// UserService.java
public User registerOrUpgradeCustomer(RegisterDTO dto) {
    // 1. Validate email
    validateEmail(dto.getEmail());
    
    // 2. Check existing user via Repository
    Optional<User> existingByEmail = userRepository.findByEmail(dto.getEmail());
    
    // 3. Get customer role via Repository
    Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
            .orElseThrow(() -> new RoleNotFoundException("name", "ROLE_CUSTOMER"));
    
    if (existingByEmail.isPresent()) {
        // Business logic: upgrade guest to customer
        User existing = existingByEmail.get();
        boolean isGuest = existing.getRole() != null 
                && "ROLE_GUEST".equals(existing.getRole().getName());
        
        if (!isGuest) {
            throw new DuplicateUserException("Email", dto.getEmail());
        }
        
        // Update entity
        existing.setFullName(dto.getFullName());
        existing.setPassword(passwordEncoder.encode(dto.getPassword()));
        existing.setRole(customerRole);
        
        // 4. Save via Repository
        return userRepository.save(existing);
    }
    
    // Business logic: create new customer
    User user = new User(dto.getEmail(), passwordEncoder.encode(dto.getPassword()));
    user.setFullName(dto.getFullName());
    user.setPhone(dto.getPhone());
    user.setCompany(dto.getCompany());
    user.setRole(customerRole);
    
    // 5. Save via Repository
    return userRepository.save(user);
}
```

**Nhiệm vụ Service:**
- Validate business rules (email duplicate, role validation)
- Encode password (security logic)
- Gọi nhiều Repository (UserRepository, RoleRepository)
- Handle business exceptions
- Transaction management

#### 4. Repository truy cập database

```java
// UserRepository.java - Interface only
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    // Spring Data JPA tự generate SQL:
    // SELECT * FROM users WHERE email = ?
}

// RoleRepository.java
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
    // SQL: SELECT * FROM roles WHERE name = ?
}
```

**Nhiệm vụ Repository:**
- Generate SQL queries
- Execute queries
- Map database rows → Entity objects

#### 5. Database thực thi

```sql
-- userRepository.findByEmail("john@example.com")
SELECT * FROM users WHERE email = 'john@example.com';

-- roleRepository.findByName("ROLE_CUSTOMER")
SELECT * FROM roles WHERE name = 'ROLE_CUSTOMER';

-- userRepository.save(user)
INSERT INTO users (email, password, full_name, phone, company, role_id, created_at, updated_at)
VALUES ('john@example.com', '$2a$10$...', 'John Doe', '0123456789', 'ABC Corp', 3, NOW(), NOW());
```

#### 6. Response trả về client

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
    "type": "Bearer",
    "user": {
      "id": 15,
      "email": "john@example.com",
      "fullName": "John Doe",
      "phone": "0123456789",
      "company": "ABC Corp",
      "isActive": true,
      "roleId": 3,
      "role": "ROLE_CUSTOMER",
      "roleGroup": "EXTERNAL"
    }
  }
}
```

---

## Mapper - Entity ↔ DTO

### Vai trò
- Convert giữa Entity và DTO
- Tách biệt database structure và API response

### Ví dụ: EntityMapper

```java
@Component
public class EntityMapper {
    
    /**
     * Convert User entity sang UserDTO
     * Loại bỏ thông tin nhạy cảm (password)
     */
    public UserDTO toUserDTO(User user) {
        if (user == null) {
            return null;
        }
        
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .company(user.getCompany())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLogin(user.getLastLogin())
                .roleId(user.getRole() != null ? user.getRole().getId() : null)
                .role(user.getRole() != null ? user.getRole().getName() : null)
                .roleGroup(user.getRoleGroup() != null ? user.getRoleGroup().name() : null)
                .build();
        // Không map password!
    }
}
```

**Vị trí**: `src/main/java/com/example/seatrans/shared/mapper/EntityMapper.java`

---

## Tổng kết quan hệ giữa các layer

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                  (React/Next.js Frontend)                   │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP Request (JSON)
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                  CONTROLLER LAYER                           │
│  - Nhận HTTP request                                        │
│  - Validate input (DTO)                                     │
│  - Authorization check                                      │
│  - Gọi Service                                              │
│  - Trả về Response (DTO)                                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                            │
│  - Business logic                                           │
│  - Validate business rules                                  │
│  - Transaction management                                   │
│  - Gọi Repository                                           │
│  - Map Entity ↔ DTO                                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                  REPOSITORY LAYER                           │
│  - Database access (CRUD)                                   │
│  - Generate SQL queries                                     │
│  - Map rows ↔ Entity                                        │
└────────────────────────────┬────────────────────────────────┘
                             │ SQL Query
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                               │
│                    (MySQL/PostgreSQL)                       │
└─────────────────────────────────────────────────────────────┘

        ┌─────────────────────────────────┐
        │       SUPPORTING LAYERS         │
        ├─────────────────────────────────┤
        │ Model (Entity)                  │ ← Database structure
        │ DTO                             │ ← API request/response
        │ Mapper                          │ ← Entity ↔ DTO conversion
        │ Exception                       │ ← Error handling
        │ Security                        │ ← JWT, Authorization
        └─────────────────────────────────┘
```

---

## Best Practices

### 1. Single Responsibility Principle
- **Controller**: Chỉ lo HTTP request/response
- **Service**: Chỉ lo business logic
- **Repository**: Chỉ lo database access
- **Model**: Chỉ lo data structure
- **DTO**: Chỉ lo data transfer

### 2. Dependency Injection
```java
@Service
@RequiredArgsConstructor  // Lombok auto-generate constructor
public class UserService {
    private final UserRepository userRepository;  // Inject qua constructor
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
}
```

### 3. Transaction Management
```java
@Transactional  // Service layer
public User updateUser(Long id, User data) {
    User user = userRepository.findById(id).orElseThrow();
    user.setFullName(data.getFullName());
    return userRepository.save(user);
    // Tự động commit hoặc rollback nếu có exception
}
```

### 4. Exception Handling
```java
// Custom exception
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long id) {
        super("User not found with id: " + id);
    }
}

// Global exception handler
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(404)
            .body(ApiResponse.error(ex.getMessage()));
    }
}
```

### 5. DTO Validation
```java
@Data
public class RegisterDTO {
    @NotBlank
    @Email
    private String email;
    
    @Size(min = 8)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$")
    private String password;
}

// Controller
@PostMapping("/register")
public ResponseEntity<?> register(@Valid @RequestBody RegisterDTO dto) {
    // @Valid tự động validate, throw MethodArgumentNotValidException nếu fail
}
```

---

## So sánh với React/Next.js (Frontend)

| Backend (Spring Boot) | Frontend (React/Next.js) | Vai trò |
|----------------------|--------------------------|---------|
| Model (Entity) | Type/Interface | Data structure |
| DTO | API request/response types | Data transfer |
| Repository | API service (fetch/axios) | Data fetching |
| Service | Custom hooks, utils | Business logic |
| Controller | API routes (`app/api/`) | API endpoints (Next.js) |
| Mapper | Utility functions | Data transformation |

---

## Kết luận

**Layered Architecture** giúp:
- ✅ **Separation of Concerns**: Mỗi layer có trách nhiệm riêng
- ✅ **Maintainability**: Dễ bảo trì, sửa lỗi
- ✅ **Testability**: Dễ viết unit test cho từng layer
- ✅ **Scalability**: Dễ mở rộng chức năng
- ✅ **Reusability**: Service có thể dùng lại cho nhiều Controller

**Luồng chuẩn**:
```
Client → Controller → Service → Repository → Database
                 ↓         ↓         ↓
               DTO     Business    Entity
                       Logic
```

**Lưu ý**:
- KHÔNG bao giờ gọi Repository từ Controller (phải qua Service)
- KHÔNG để business logic trong Controller hoặc Repository
- LUÔN dùng DTO để trả về cho client (không trả Entity trực tiếp)
- LUÔN validate dữ liệu ở Controller level (DTO validation) VÀ Service level (business rules)

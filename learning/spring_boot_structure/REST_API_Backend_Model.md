# Mô Hình Hoạt Động Chi Tiết của REST API ở Backend

## 1. Tổng Quan về REST API

REST (Representational State Transfer) là một kiến trúc phần mềm cho phép client và server giao tiếp với nhau thông qua giao thức HTTP.

## 2. Luồng Hoạt Động Của REST API

```
Client → HTTP Request → Server (Backend)
                           ↓
                    1. Controller Layer
                           ↓
                    2. Service Layer
                           ↓
                    3. Repository/DAO Layer
                           ↓
                    4. Database
                           ↓
                    5. Trả kết quả ngược lại
                           ↓
Server → HTTP Response → Client
```

## 3. Các Tầng (Layers) Trong Backend

### 3.1. Controller Layer (Tầng Điều Khiển)
- **Nhiệm vụ**: Nhận HTTP request từ client, xử lý routing
- **Chức năng**:
  - Mapping các endpoint (URL)
  - Nhận và validate dữ liệu từ request
  - Gọi Service Layer
  - Trả về HTTP response với status code phù hợp

**Ví dụ**:
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userService.findById(id);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User savedUser = userService.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }
}
```

### 3.2. Service Layer (Tầng Nghiệp Vụ)
- **Nhiệm vụ**: Xử lý logic nghiệp vụ (business logic)
- **Chức năng**:
  - Thực hiện các quy tắc nghiệp vụ
  - Xử lý dữ liệu
  - Gọi Repository để thao tác với database
  - Xử lý exception

**Ví dụ**:
```java
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public User findById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
    }
    
    public User save(User user) {
        // Business logic: validate, transform data
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            throw new InvalidDataException("Email is required");
        }
        return userRepository.save(user);
    }
}
```

### 3.3. Repository/DAO Layer (Tầng Truy Cập Dữ Liệu)
- **Nhiệm vụ**: Giao tiếp trực tiếp với database
- **Chức năng**:
  - Thực hiện các truy vấn CRUD (Create, Read, Update, Delete)
  - Mapping giữa object và database

**Ví dụ**:
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByAgeGreaterThan(int age);
}
```

### 3.4. Model/Entity Layer (Tầng Mô Hình Dữ Liệu)
- **Nhiệm vụ**: Định nghĩa cấu trúc dữ liệu
- **Chức năng**: Mapping với bảng trong database

**Ví dụ**:
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(unique = true)
    private String email;
    
    private int age;
    
    // Getters and Setters
}
```

## 4. HTTP Methods và CRUD Operations

| HTTP Method | CRUD Operation | Mục đích | Ví dụ URL |
|-------------|----------------|----------|-----------|
| GET | Read | Lấy dữ liệu | GET /api/users/1 |
| POST | Create | Tạo mới | POST /api/users |
| PUT | Update | Cập nhật toàn bộ | PUT /api/users/1 |
| PATCH | Update | Cập nhật một phần | PATCH /api/users/1 |
| DELETE | Delete | Xóa | DELETE /api/users/1 |

## 5. Chi Tiết Request-Response Flow

### 5.1. Request Flow (Luồng Yêu Cầu)
```
1. Client gửi HTTP Request
   ↓
2. Request đi qua các Filter/Interceptor (security, logging, etc.)
   ↓
3. DispatcherServlet nhận request
   ↓
4. HandlerMapping tìm Controller phù hợp
   ↓
5. Controller nhận request
   ↓
6. Controller gọi Service
   ↓
7. Service thực hiện business logic
   ↓
8. Service gọi Repository
   ↓
9. Repository thực hiện query vào Database
   ↓
10. Database trả kết quả
```

### 5.2. Response Flow (Luồng Phản Hồi)
```
1. Database trả dữ liệu cho Repository
   ↓
2. Repository trả Entity cho Service
   ↓
3. Service xử lý và trả kết quả cho Controller
   ↓
4. Controller tạo ResponseEntity với status code
   ↓
5. Response đi qua các Filter/Interceptor
   ↓
6. Server gửi HTTP Response về Client
```

## 6. HTTP Status Codes Thường Dùng

### 6.1. Success (2xx)
- **200 OK**: Request thành công
- **201 Created**: Tạo resource thành công
- **204 No Content**: Thành công nhưng không trả về dữ liệu

### 6.2. Client Error (4xx)
- **400 Bad Request**: Dữ liệu gửi lên không hợp lệ
- **401 Unauthorized**: Chưa xác thực
- **403 Forbidden**: Không có quyền truy cập
- **404 Not Found**: Không tìm thấy resource

### 6.3. Server Error (5xx)
- **500 Internal Server Error**: Lỗi server
- **503 Service Unavailable**: Service không khả dụng

## 7. Ví Dụ Hoàn Chỉnh: Tạo User Mới

### Request từ Client
```http
POST /api/users HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "name": "Nguyen Van A",
  "email": "nguyenvana@example.com",
  "age": 25
}
```

### Xử Lý ở Backend

**1. Controller nhận request:**
```java
@PostMapping
public ResponseEntity<User> createUser(@RequestBody User user) {
    User savedUser = userService.save(user);
    return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
}
```

**2. Service xử lý business logic:**
```java
public User save(User user) {
    // Validate email
    if (userRepository.findByEmail(user.getEmail()).isPresent()) {
        throw new DuplicateEmailException("Email already exists");
    }
    // Save to database
    return userRepository.save(user);
}
```

**3. Repository lưu vào database:**
```java
// JPA tự động tạo query: INSERT INTO users (name, email, age) VALUES (?, ?, ?)
```

### Response về Client
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 1,
  "name": "Nguyen Van A",
  "email": "nguyenvana@example.com",
  "age": 25
}
```

## 8. Exception Handling (Xử Lý Lỗi)

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            System.currentTimeMillis()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(InvalidDataException.class)
    public ResponseEntity<ErrorResponse> handleInvalidData(InvalidDataException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            ex.getMessage(),
            System.currentTimeMillis()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
```

## 9. Best Practices (Thực Hành Tốt)

### 9.1. RESTful API Design
- Sử dụng danh từ số nhiều cho endpoint: `/api/users` thay vì `/api/user`
- Sử dụng HTTP methods đúng mục đích
- Trả về status code phù hợp
- Versioning API: `/api/v1/users`

### 9.2. Security
- Implement authentication (JWT, OAuth2)
- Validate input data
- Use HTTPS
- Implement rate limiting

### 9.3. Performance
- Sử dụng caching
- Pagination cho list data lớn
- Lazy loading cho relationships

### 9.4. Documentation
- Sử dụng Swagger/OpenAPI để document API
- Viết clear error messages

## 10. Dependency Injection (DI)

Spring Boot sử dụng DI để quản lý các bean:

```java
// Spring tự động inject UserService vào Controller
@Autowired
private UserService userService;

// Spring tự động inject UserRepository vào Service
@Autowired
private UserRepository userRepository;
```

**Lợi ích**:
- Loose coupling (liên kết lỏng)
- Dễ test
- Dễ maintain và mở rộng

## 11. Database Connection Flow

```
Application Startup
    ↓
Spring Boot đọc application.properties
    ↓
Tạo DataSource (connection pool)
    ↓
JPA/Hibernate tạo EntityManager
    ↓
Repository sử dụng EntityManager để query
    ↓
Connection pool quản lý kết nối đến database
```

## 12. Tổng Kết

REST API Backend hoạt động theo mô hình phân tầng:
1. **Controller**: Nhận request, trả response
2. **Service**: Xử lý business logic
3. **Repository**: Giao tiếp với database
4. **Database**: Lưu trữ dữ liệu

Mỗi tầng có trách nhiệm riêng, giúp code dễ maintain, test và mở rộng.

### Key Points:
- REST API sử dụng HTTP methods (GET, POST, PUT, DELETE)
- Mỗi endpoint tương ứng với một operation
- Backend xử lý theo luồng: Controller → Service → Repository → Database
- Response trả về với status code và data phù hợp
- Exception handling đảm bảo API hoạt động ổn định

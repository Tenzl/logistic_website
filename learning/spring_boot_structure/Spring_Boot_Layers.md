# Các Layer Chính trong Spring Boot REST API

## Tổng Quan

Spring Boot REST API được xây dựng theo kiến trúc phân tầng (Layered Architecture), mỗi tầng có trách nhiệm riêng biệt và giao tiếp với nhau theo thứ tự.

---

## 1. Entity/Model Layer (Tầng Mô hình dữ liệu)

### Đặc điểm:
- **Tạo đầu tiên** trong quá trình phát triển
- **Ý nghĩa**: Định nghĩa cấu trúc dữ liệu, mapping với bảng trong database
- **Annotation chính**: `@Entity`, `@Table`, `@Id`, `@Column`

### Ví dụ:
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private Integer age;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Constructors
    public User() {}
    
    public User(String name, String email, Integer age) {
        this.name = name;
        this.email = email;
        this.age = age;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
}
```

### Trách nhiệm:
- ✅ Định nghĩa cấu trúc dữ liệu
- ✅ Mapping với bảng database
- ✅ Chứa getters/setters
- ❌ KHÔNG chứa business logic
- ❌ KHÔNG gọi database

---

## 2. Repository Layer (Tầng Truy cập Dữ liệu)

### Đặc điểm:
- **Tạo thứ hai** sau khi có Entity
- **Ý nghĩa**: Giao tiếp trực tiếp với database, thực hiện các thao tác CRUD
- **Annotation**: `@Repository`
- **Extends**: `JpaRepository<Entity, ID>`

### Ví dụ:
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Tìm user theo email
    Optional<User> findByEmail(String email);
    
    // Tìm users theo tuổi lớn hơn
    List<User> findByAgeGreaterThan(Integer age);
    
    // Tìm users theo tên chứa keyword
    List<User> findByNameContaining(String keyword);
    
    // Custom query với @Query
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.age > :age")
    Optional<User> findByEmailAndAgeGreaterThan(
        @Param("email") String email, 
        @Param("age") Integer age
    );
    
    // Native SQL query
    @Query(value = "SELECT * FROM users WHERE name LIKE %:name%", nativeQuery = true)
    List<User> searchByName(@Param("name") String name);
    
    // Kiểm tra email có tồn tại không
    boolean existsByEmail(String email);
    
    // Đếm số users theo tuổi
    long countByAge(Integer age);
    
    // Xóa user theo email
    void deleteByEmail(String email);
}
```

### Methods có sẵn từ JpaRepository:
```java
// Lưu/cập nhật
save(Entity entity)
saveAll(Iterable<Entity> entities)

// Tìm kiếm
findById(ID id)
findAll()
findAllById(Iterable<ID> ids)

// Xóa
delete(Entity entity)
deleteById(ID id)
deleteAll()

// Kiểm tra
existsById(ID id)
count()
```

### Trách nhiệm:
- ✅ CRUD với database
- ✅ Tạo các query method
- ✅ Custom query với @Query
- ❌ KHÔNG chứa business logic
- ❌ KHÔNG xử lý HTTP request/response

---

## 3. Service Layer (Tầng Nghiệp vụ)

### Đặc điểm:
- **Tạo thứ ba** sau khi có Repository
- **Ý nghĩa**: Xử lý business logic, validate dữ liệu, điều phối các Repository
- **Annotation**: `@Service`

### Ví dụ:
```java
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Tìm user theo ID
    public User findById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }
    
    // Lấy tất cả users
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    // Tạo user mới
    public User createUser(User user) {
        // Business logic: Validate
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            throw new InvalidDataException("Name cannot be empty");
        }
        
        if (user.getEmail() == null || !user.getEmail().contains("@")) {
            throw new InvalidDataException("Invalid email format");
        }
        
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new DuplicateEmailException("Email already exists");
        }
        
        // Validate age
        if (user.getAge() != null && user.getAge() < 0) {
            throw new InvalidDataException("Age cannot be negative");
        }
        
        // Set created date
        user.setCreatedAt(LocalDateTime.now());
        
        // Lưu vào database
        return userRepository.save(user);
    }
    
    // Cập nhật user
    public User updateUser(Long id, User userDetails) {
        User user = findById(id);
        
        // Validate và update
        if (userDetails.getName() != null) {
            user.setName(userDetails.getName());
        }
        
        if (userDetails.getEmail() != null) {
            // Kiểm tra email mới có trùng với user khác không
            if (!user.getEmail().equals(userDetails.getEmail()) 
                && userRepository.existsByEmail(userDetails.getEmail())) {
                throw new DuplicateEmailException("Email already exists");
            }
            user.setEmail(userDetails.getEmail());
        }
        
        if (userDetails.getAge() != null) {
            if (userDetails.getAge() < 0) {
                throw new InvalidDataException("Age cannot be negative");
            }
            user.setAge(userDetails.getAge());
        }
        
        return userRepository.save(user);
    }
    
    // Xóa user
    public void deleteUser(Long id) {
        User user = findById(id);
        userRepository.delete(user);
    }
    
    // Tìm user theo email
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }
    
    // Tìm users theo tuổi
    public List<User> findByAgeGreaterThan(Integer age) {
        if (age < 0) {
            throw new InvalidDataException("Age cannot be negative");
        }
        return userRepository.findByAgeGreaterThan(age);
    }
    
    // Business logic phức tạp hơn
    public boolean isAdult(Long userId) {
        User user = findById(userId);
        return user.getAge() != null && user.getAge() >= 18;
    }
}
```

### Trách nhiệm:
- ✅ Business logic
- ✅ Validate dữ liệu
- ✅ Gọi Repository để thao tác database
- ✅ Xử lý exception
- ✅ Transform/process dữ liệu
- ❌ KHÔNG truy cập database trực tiếp (phải qua Repository)
- ❌ KHÔNG xử lý HTTP request/response

---

## 4. Controller Layer (Tầng Điều khiển)

### Đặc điểm:
- **Tạo cuối cùng** sau khi có Service
- **Ý nghĩa**: Nhận HTTP request, gọi Service, trả về HTTP response
- **Annotation**: `@RestController`, `@RequestMapping`, `@GetMapping`, `@PostMapping`, etc.

### Ví dụ:
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // GET /api/users - Lấy tất cả users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAll();
        return ResponseEntity.ok(users);
    }
    
    // GET /api/users/1 - Lấy user theo ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.findById(id);
        return ResponseEntity.ok(user);
    }
    
    // POST /api/users - Tạo user mới
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }
    
    // PUT /api/users/1 - Cập nhật user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestBody User userDetails) {
        User updatedUser = userService.updateUser(id, userDetails);
        return ResponseEntity.ok(updatedUser);
    }
    
    // DELETE /api/users/1 - Xóa user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
    // GET /api/users/email/abc@example.com - Tìm theo email
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(user);
    }
    
    // GET /api/users/age/18 - Tìm users có tuổi lớn hơn
    @GetMapping("/age/{age}")
    public ResponseEntity<List<User>> getUsersByAge(@PathVariable Integer age) {
        List<User> users = userService.findByAgeGreaterThan(age);
        return ResponseEntity.ok(users);
    }
    
    // GET /api/users/search?name=John - Search với query parameter
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String name) {
        // Implement search logic in service
        return ResponseEntity.ok(new ArrayList<>());
    }
}
```

### Annotations quan trọng:

| Annotation | Mục đích | HTTP Method |
|------------|----------|-------------|
| `@GetMapping` | Lấy dữ liệu | GET |
| `@PostMapping` | Tạo mới | POST |
| `@PutMapping` | Cập nhật toàn bộ | PUT |
| `@PatchMapping` | Cập nhật một phần | PATCH |
| `@DeleteMapping` | Xóa | DELETE |
| `@PathVariable` | Lấy giá trị từ URL | - |
| `@RequestBody` | Lấy dữ liệu từ body | - |
| `@RequestParam` | Lấy query parameter | - |

### Trách nhiệm:
- ✅ Nhận HTTP request
- ✅ Mapping URL (routing)
- ✅ Validate request parameters
- ✅ Gọi Service
- ✅ Trả về HTTP response với status code
- ❌ KHÔNG chứa business logic
- ❌ KHÔNG gọi Repository trực tiếp

---

## Thứ Tự Tạo Layer (Từ trong ra ngoài)

```
1. Entity Layer (Model)
   ↓
2. Repository Layer
   ↓
3. Service Layer
   ↓
4. Controller Layer
```

### Lý do thứ tự này:
1. **Entity** phải có trước vì Repository cần biết làm việc với Entity nào
2. **Repository** phải có trước vì Service cần gọi Repository
3. **Service** phải có trước vì Controller cần gọi Service
4. **Controller** tạo cuối cùng vì nó phụ thuộc vào tất cả các layer bên dưới

---

## Luồng Dữ Liệu (Request → Response)

### Request Flow:
```
1. Client gửi HTTP Request
   ↓
2. Controller nhận request (@GetMapping, @PostMapping, etc.)
   ↓
3. Controller gọi Service method
   ↓
4. Service xử lý business logic
   ↓
5. Service gọi Repository method
   ↓
6. Repository thực hiện query vào Database
   ↓
7. Database trả kết quả
```

### Response Flow:
```
1. Database trả dữ liệu cho Repository
   ↓
2. Repository trả Entity cho Service
   ↓
3. Service xử lý/transform dữ liệu
   ↓
4. Service trả kết quả cho Controller
   ↓
5. Controller tạo ResponseEntity với status code
   ↓
6. Server gửi HTTP Response về Client
```

---

## Bảng So Sánh Trách Nhiệm

| Layer | Nhiệm vụ chính | Được làm | Không được làm |
|-------|----------------|----------|----------------|
| **Entity** | Định nghĩa dữ liệu | - Khai báo fields<br>- Getters/Setters<br>- Mapping với DB | - Business logic<br>- Gọi database<br>- HTTP handling |
| **Repository** | Truy cập database | - CRUD operations<br>- Query methods<br>- Custom queries | - Business logic<br>- Validate<br>- HTTP handling |
| **Service** | Business logic | - Validate<br>- Xử lý logic<br>- Gọi Repository<br>- Handle exception | - Truy cập DB trực tiếp<br>- HTTP handling |
| **Controller** | HTTP handling | - Nhận request<br>- Gọi Service<br>- Trả response<br>- Routing | - Business logic<br>- Gọi Repository<br>- Truy cập DB |

---

## Dependency Injection (@Autowired)

### Cách các layer kết nối với nhau:

```java
// Controller inject Service
@RestController
public class UserController {
    @Autowired
    private UserService userService;  // Spring tự động inject
}

// Service inject Repository
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;  // Spring tự động inject
}
```

### Quy tắc:
- Controller → Service (được phép)
- Service → Repository (được phép)
- Service → Service (được phép)
- Controller → Repository (❌ KHÔNG nên, phá vỡ kiến trúc)

---

## Tại Sao Phân Tầng?

### ✅ Lợi ích:

1. **Separation of Concerns**: Mỗi tầng có trách nhiệm riêng biệt
2. **Dễ bảo trì**: Sửa một tầng không ảnh hưởng tầng khác
3. **Dễ test**: Test từng tầng độc lập
4. **Tái sử dụng**: Service có thể dùng cho nhiều Controller
5. **Mở rộng dễ dàng**: Thêm tính năng mới không ảnh hưởng code cũ
6. **Team work**: Nhiều người làm cùng lúc các tầng khác nhau

### ❌ Không phân tầng sẽ như thế nào:

```java
// Controller làm tất cả - RẤT TỆ!
@RestController
public class BadController {
    @GetMapping("/users/{id}")
    public User getUser(@PathVariable Long id) {
        // Kết nối database trực tiếp - SAI!
        Connection conn = DriverManager.getConnection("jdbc:...");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE id = " + id);
        
        // Business logic lẫn lộn - SAI!
        User user = new User();
        if (rs.next()) {
            user.setName(rs.getString("name"));
            // ...
        }
        
        return user;
    }
}
```

**Vấn đề**:
- Khó test
- Khó maintain
- Code lặp lại
- Không tái sử dụng được
- Không an toàn (SQL injection)

---

## Ví Dụ Hoàn Chỉnh: Tạo User Mới

### 1. Entity (User.java):
```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    private Integer age;
    // Getters, Setters
}
```

### 2. Repository (UserRepository.java):
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
}
```

### 3. Service (UserService.java):
```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public User createUser(User user) {
        // Validate
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new DuplicateEmailException("Email exists");
        }
        // Save
        return userRepository.save(user);
    }
}
```

### 4. Controller (UserController.java):
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;
    
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User created = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
```

### Luồng thực thi:
```
Client POST /api/users
    ↓
UserController.createUser()
    ↓
UserService.createUser()
    ↓
UserRepository.existsByEmail() → false
    ↓
UserRepository.save()
    ↓
Database INSERT
    ↓
Return User entity
    ↓
Return ResponseEntity 201 Created
```

---

## Best Practices

### ✅ Nên làm:
- Tuân thủ đúng trách nhiệm từng layer
- Service phải chứa tất cả business logic
- Controller chỉ xử lý HTTP, không có logic
- Repository chỉ giao tiếp với database
- Sử dụng DTO (Data Transfer Object) để tách biệt Entity và Response

### ❌ Không nên:
- Controller gọi Repository trực tiếp
- Để business logic trong Controller
- Repository có business logic
- Entity có logic phức tạp

---

## DTO Pattern (Bổ sung)

### Tại sao cần DTO?
- Entity có thể có nhiều field nhạy cảm (password, etc.)
- Response cần format khác với Entity
- Tách biệt database structure với API structure

### Ví dụ:
```java
// DTO cho request
public class CreateUserRequest {
    private String name;
    private String email;
    private Integer age;
    // Getters, Setters
}

// DTO cho response
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    // KHÔNG trả về password hoặc sensitive data
}

// Controller
@PostMapping
public ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest request) {
    User user = userService.createUser(request);
    UserResponse response = convertToResponse(user);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
}
```

---

## Tổng Kết

### Quy trình phát triển:
1. Tạo **Entity** → định nghĩa dữ liệu
2. Tạo **Repository** → CRUD với database
3. Tạo **Service** → business logic
4. Tạo **Controller** → API endpoints

### Nguyên tắc vàng:
- **Mỗi layer chỉ làm một việc**
- **Không nhảy cóc**: Controller → Service → Repository → Database
- **Dependency Injection**: Dùng @Autowired để kết nối các layer
- **Test từng layer**: Unit test cho Service, Integration test cho Controller

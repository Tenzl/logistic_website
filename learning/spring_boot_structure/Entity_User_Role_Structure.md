# Entity Structure - User Management với Role Groups

## Tổng Quan

Sử dụng **Role Groups** để phân tách rõ ràng giữa:
- **INTERNAL**: Nhân viên nội bộ (Admin, Employee)
- **EXTERNAL**: Khách hàng bên ngoài (Customer)

Một user chỉ thuộc một nhóm, nhưng có thể có nhiều roles trong cùng nhóm.

---

## 1. Entity: User (Base Entity)

### Mục đích:
Entity chính chứa thông tin đăng nhập và thông tin cơ bản của tất cả người dùng.

### Attributes:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Long | PK, Auto-increment | ID duy nhất |
| username | String(50) | Unique, Not Null | Tên đăng nhập |
| email | String(100) | Unique, Not Null | Email |
| password | String(255) | Not Null | Mật khẩu (hashed) |
| fullName | String(100) | | Họ tên đầy đủ |
| phone | String(20) | | Số điện thoại |
| isActive | Boolean | Default: true | Trạng thái kích hoạt |
| createdAt | LocalDateTime | | Ngày tạo |
| updatedAt | LocalDateTime | | Ngày cập nhật |
| lastLogin | LocalDateTime | | Lần đăng nhập cuối |
| roles | Set\<Role\> | ManyToMany | Danh sách roles |

### Relationships:
- **ManyToMany** với Role (qua bảng user_roles)
- **OneToOne** với Customer (nếu là customer)
- **OneToOne** với Employee (nếu là employee)

### Business Rules:
- Username: 6-50 ký tự, chỉ chữ cái, số và dấu gạch dưới
- Email: phải hợp lệ theo format email
- Password: tối thiểu 8 ký tự, phải có chữ hoa, chữ thường, số
- Phone: format số điện thoại hợp lệ (optional)
- Mặc định isActive = true khi tạo mới
- createdAt tự động set khi tạo
- updatedAt tự động update khi sửa

### Methods:
```java
// Helper methods
void addRole(Role role)
void removeRole(Role role)
boolean hasRole(String roleName)
boolean hasAnyRole(String... roleNames)
Set<String> getRoleNames()
RoleGroup getRoleGroup()  // Lấy role group của user
```

---

## 2. Entity: Role

### Mục đích:
Định nghĩa các vai trò trong hệ thống và nhóm vai trò.

### Attributes:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Long | PK, Auto-increment | ID duy nhất |
| name | String(50) | Unique, Not Null | Tên role (ROLE_ADMIN, ROLE_EMPLOYEE, ROLE_CUSTOMER) |
| description | String(255) | | Mô tả role |
| roleGroup | RoleGroup | Not Null | Nhóm role (INTERNAL/EXTERNAL) |
| users | Set\<User\> | ManyToMany | Danh sách users có role này |
| createdAt | LocalDateTime | | Ngày tạo |

### Relationships:
- **ManyToMany** với User (qua bảng user_roles)

### Business Rules:
- Name phải có prefix "ROLE_"
- Name phải unique
- RoleGroup không được null
- Không xóa được role nếu còn user đang sử dụng

### Predefined Roles:
```
1. ROLE_ADMIN
   - Group: INTERNAL
   - Description: "Administrator with full system access"

2. ROLE_EMPLOYEE
   - Group: INTERNAL
   - Description: "Employee with operational access"

3. ROLE_CUSTOMER
   - Group: EXTERNAL
   - Description: "Customer user"
```

---

## 3. Enum: RoleGroup

### Mục đích:
Phân loại roles thành các nhóm để kiểm soát xung đột.

### Values:

| Value | Description | Allowed Roles |
|-------|-------------|---------------|
| INTERNAL | Nhân viên nội bộ | ROLE_ADMIN, ROLE_EMPLOYEE |
| EXTERNAL | Khách hàng bên ngoài | ROLE_CUSTOMER |

### Business Rules:
- Một user KHÔNG thể có roles từ 2 groups khác nhau
- Một user CÓ THỂ có nhiều roles trong cùng 1 group

### Examples:
```
✅ ALLOWED:
- User A: ADMIN + EMPLOYEE (cùng INTERNAL)
- User B: CUSTOMER (EXTERNAL)

❌ NOT ALLOWED:
- User C: ADMIN + CUSTOMER (INTERNAL + EXTERNAL - conflict!)
- User D: EMPLOYEE + CUSTOMER (INTERNAL + EXTERNAL - conflict!)
```

---

## 4. Entity: Customer (Extended Info)

### Mục đích:
Lưu thông tin chi tiết của khách hàng.

### Attributes:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Long | PK, Auto-increment | ID duy nhất |
| userId | Long | FK to User, Unique, Not Null | Liên kết với User |
| customerCode | String(20) | Unique, Not Null | Mã khách hàng (auto) |
| companyName | String(200) | | Tên công ty |
| taxCode | String(50) | | Mã số thuế |
| customerType | CustomerType | Not Null | Loại khách hàng |
| address | String(500) | | Địa chỉ |
| city | String(100) | | Thành phố |
| country | String(100) | | Quốc gia |
| postalCode | String(20) | | Mã bưu điện |
| loyaltyPoints | Integer | Default: 0 | Điểm tích lũy |
| membershipLevel | MembershipLevel | Default: BRONZE | Cấp độ thành viên |
| creditLimit | BigDecimal | Default: 0 | Hạn mức tín dụng |
| createdAt | LocalDateTime | | Ngày tạo |
| updatedAt | LocalDateTime | | Ngày cập nhật |
| user | User | OneToOne | Thông tin user |

### Relationships:
- **OneToOne** với User
- **OneToMany** với Order (một customer có nhiều orders)
- **OneToMany** với Quotation (một customer có nhiều quotations)

### Business Rules:
- customerCode tự động generate theo format: CUST-YYYYMMDD-XXXX
- loyaltyPoints >= 0
- creditLimit >= 0
- Nếu customerType = COMPANY thì companyName và taxCode bắt buộc

### Methods:
```java
// Helper methods
void addLoyaltyPoints(int points)
void deductLoyaltyPoints(int points)
void updateMembershipLevel()  // Auto calculate based on points
boolean canPurchase(BigDecimal amount)  // Check credit limit
```

---

## 5. Enum: CustomerType

### Values:
- **INDIVIDUAL**: Cá nhân
- **COMPANY**: Công ty/Doanh nghiệp

### Usage:
```java
if (customer.getCustomerType() == CustomerType.COMPANY) {
    // Require companyName and taxCode
}
```

---

## 6. Enum: MembershipLevel

### Mục đích:
Phân cấp khách hàng dựa trên điểm tích lũy để áp dụng ưu đãi.

### Values & Requirements:

| Level | Min Points | Discount | Benefits |
|-------|------------|----------|----------|
| BRONZE | 0 | 0% | Cơ bản |
| SILVER | 1,000 | 5% | Ưu tiên hỗ trợ |
| GOLD | 5,000 | 10% | Dedicated account manager |
| PLATINUM | 10,000 | 15% | VIP services, priority shipping |

### Auto-calculation Logic:
```
if (loyaltyPoints >= 10,000) → PLATINUM
else if (loyaltyPoints >= 5,000) → GOLD
else if (loyaltyPoints >= 1,000) → SILVER
else → BRONZE
```

---

## 7. Entity: Employee (Extended Info)

### Mục đích:
Lưu thông tin chi tiết của nhân viên.

### Attributes:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Long | PK, Auto-increment | ID duy nhất |
| userId | Long | FK to User, Unique, Not Null | Liên kết với User |
| employeeCode | String(20) | Unique, Not Null | Mã nhân viên (auto) |
| department | Department | Not Null | Phòng ban |
| position | String(100) | | Chức vụ |
| hireDate | LocalDate | Not Null | Ngày vào làm |
| salary | BigDecimal | | Lương (optional, sensitive) |
| commissionRate | BigDecimal | Default: 0 | Tỷ lệ hoa hồng (%) |
| managerId | Long | FK to Employee | ID của manager |
| isActive | Boolean | Default: true | Trạng thái làm việc |
| createdAt | LocalDateTime | | Ngày tạo |
| updatedAt | LocalDateTime | | Ngày cập nhật |
| user | User | OneToOne | Thông tin user |
| manager | Employee | ManyToOne | Manager trực tiếp |
| subordinates | List\<Employee\> | OneToMany | Nhân viên cấp dưới |

### Relationships:
- **OneToOne** với User
- **ManyToOne** với Employee (manager)
- **OneToMany** với Employee (subordinates)
- **OneToMany** với Order (orders phụ trách)
- **OneToMany** với Quotation (quotations tạo)

### Business Rules:
- employeeCode tự động generate theo format: EMP-YYYYMMDD-XXXX
- hireDate không được trong tương lai
- salary >= 0 (nếu có)
- commissionRate: 0-100
- Manager phải là Employee khác, không được tự refer
- Manager phải thuộc cùng hoặc cấp cao hơn

### Methods:
```java
// Helper methods
List<Employee> getAllSubordinates()  // Include nested
boolean isManagerOf(Employee employee)
BigDecimal calculateCommission(BigDecimal orderAmount)
int getYearsOfService()
```

---

## 8. Enum: Department

### Values:
- **SALES**: Kinh doanh
- **OPERATIONS**: Vận hành
- **FINANCE**: Tài chính
- **CUSTOMER_SERVICE**: Chăm sóc khách hàng
- **ADMINISTRATION**: Hành chính
- **IT**: Công nghệ thông tin

---

## 9. Join Table: user_roles

### Mục đích:
Bảng trung gian cho quan hệ Many-to-Many giữa User và Role.

### Structure:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| user_id | Long | FK to User, Not Null | ID user |
| role_id | Long | FK to Role, Not Null | ID role |
| assigned_at | LocalDateTime | Default: NOW() | Thời gian gán role |
| assigned_by | Long | FK to User | Admin/Employee đã gán |

### Primary Key:
- Composite: (user_id, role_id)

### Indexes:
- Index on user_id
- Index on role_id

### Business Rules:
- Không cho phép duplicate (user_id, role_id)
- Khi gán role mới, kiểm tra roleGroup conflict
- Lưu lại người gán và thời gian để audit

---

## 10. Database Schema (SQL)

### Table: users
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
);
```

### Table: roles
```sql
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    role_group VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (role_group IN ('INTERNAL', 'EXTERNAL')),
    INDEX idx_role_group (role_group)
);
```

### Table: user_roles
```sql
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT,
    
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
);
```

### Table: customers
```sql
CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    customer_code VARCHAR(20) UNIQUE NOT NULL,
    company_name VARCHAR(200),
    tax_code VARCHAR(50),
    customer_type VARCHAR(20) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    loyalty_points INT DEFAULT 0,
    membership_level VARCHAR(20) DEFAULT 'BRONZE',
    credit_limit DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (customer_type IN ('INDIVIDUAL', 'COMPANY')),
    CHECK (membership_level IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM')),
    CHECK (loyalty_points >= 0),
    CHECK (credit_limit >= 0),
    
    INDEX idx_customer_code (customer_code),
    INDEX idx_user_id (user_id),
    INDEX idx_membership_level (membership_level)
);
```

### Table: employees
```sql
CREATE TABLE employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL,
    position VARCHAR(100),
    hire_date DATE NOT NULL,
    salary DECIMAL(15, 2),
    commission_rate DECIMAL(5, 2) DEFAULT 0,
    manager_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
    CHECK (department IN ('SALES', 'OPERATIONS', 'FINANCE', 'CUSTOMER_SERVICE', 'ADMINISTRATION', 'IT')),
    CHECK (salary >= 0),
    CHECK (commission_rate >= 0 AND commission_rate <= 100),
    
    INDEX idx_employee_code (employee_code),
    INDEX idx_user_id (user_id),
    INDEX idx_department (department),
    INDEX idx_manager_id (manager_id)
);
```

### Initial Data (Roles):
```sql
INSERT INTO roles (name, description, role_group) VALUES
('ROLE_ADMIN', 'Administrator with full system access', 'INTERNAL'),
('ROLE_EMPLOYEE', 'Employee with operational access', 'INTERNAL'),
('ROLE_CUSTOMER', 'Customer user', 'EXTERNAL');
```

---

## 11. Entity Code Structure (Java)

### Package Structure:
```
com.example.seatrans
├── entity
│   ├── User.java
│   ├── Role.java
│   ├── Customer.java
│   ├── Employee.java
│   └── enums
│       ├── RoleGroup.java
│       ├── CustomerType.java
│       ├── MembershipLevel.java
│       └── Department.java
├── repository
│   ├── UserRepository.java
│   ├── RoleRepository.java
│   ├── CustomerRepository.java
│   └── EmployeeRepository.java
├── service
│   ├── UserService.java
│   ├── RoleService.java
│   ├── CustomerService.java
│   └── EmployeeService.java
└── controller
    ├── AuthController.java
    ├── UserController.java
    ├── CustomerController.java
    └── EmployeeController.java
```

---

## 12. User.java (Entity Code)

```java
@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String username;
    
    @Column(unique = true, nullable = false, length = 100)
    private String email;
    
    @Column(nullable = false, length = 255)
    private String password;
    
    @Column(name = "full_name", length = 100)
    private String fullName;
    
    @Column(length = 20)
    private String phone;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Customer customer;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Employee employee;
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper methods
    public void addRole(Role role) {
        this.roles.add(role);
        role.getUsers().add(this);
    }
    
    public void removeRole(Role role) {
        this.roles.remove(role);
        role.getUsers().remove(this);
    }
    
    public boolean hasRole(String roleName) {
        return roles.stream()
            .anyMatch(role -> role.getName().equals(roleName));
    }
    
    public boolean hasAnyRole(String... roleNames) {
        return roles.stream()
            .anyMatch(role -> Arrays.asList(roleNames).contains(role.getName()));
    }
    
    public Set<String> getRoleNames() {
        return roles.stream()
            .map(Role::getName)
            .collect(Collectors.toSet());
    }
    
    public RoleGroup getRoleGroup() {
        return roles.stream()
            .map(Role::getRoleGroup)
            .findFirst()
            .orElse(null);
    }
    
    public boolean isInternal() {
        return getRoleGroup() == RoleGroup.INTERNAL;
    }
    
    public boolean isExternal() {
        return getRoleGroup() == RoleGroup.EXTERNAL;
    }
    
    // Getters and Setters
    // ... (all getters and setters)
}
```

---

## 13. Role.java (Entity Code)

```java
@Entity
@Table(name = "roles")
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String name;
    
    @Column(length = 255)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role_group", nullable = false, length = 20)
    private RoleGroup roleGroup;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @ManyToMany(mappedBy = "roles")
    private Set<User> users = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    // ... (all getters and setters)
}
```

---

## 14. RoleGroup.java (Enum)

```java
public enum RoleGroup {
    INTERNAL("Internal Staff"),
    EXTERNAL("External Customers");
    
    private final String description;
    
    RoleGroup(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
```

---

## 15. Customer.java (Entity Code)

```java
@Entity
@Table(name = "customers")
public class Customer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;
    
    @Column(name = "customer_code", unique = true, nullable = false, length = 20)
    private String customerCode;
    
    @Column(name = "company_name", length = 200)
    private String companyName;
    
    @Column(name = "tax_code", length = 50)
    private String taxCode;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type", nullable = false, length = 20)
    private CustomerType customerType;
    
    @Column(length = 500)
    private String address;
    
    @Column(length = 100)
    private String city;
    
    @Column(length = 100)
    private String country;
    
    @Column(name = "postal_code", length = 20)
    private String postalCode;
    
    @Column(name = "loyalty_points")
    private Integer loyaltyPoints = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "membership_level", length = 20)
    private MembershipLevel membershipLevel = MembershipLevel.BRONZE;
    
    @Column(name = "credit_limit", precision = 15, scale = 2)
    private BigDecimal creditLimit = BigDecimal.ZERO;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (customerCode == null) {
            customerCode = generateCustomerCode();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper methods
    public void addLoyaltyPoints(int points) {
        this.loyaltyPoints += points;
        updateMembershipLevel();
    }
    
    public void deductLoyaltyPoints(int points) {
        this.loyaltyPoints = Math.max(0, this.loyaltyPoints - points);
        updateMembershipLevel();
    }
    
    public void updateMembershipLevel() {
        if (loyaltyPoints >= 10000) {
            membershipLevel = MembershipLevel.PLATINUM;
        } else if (loyaltyPoints >= 5000) {
            membershipLevel = MembershipLevel.GOLD;
        } else if (loyaltyPoints >= 1000) {
            membershipLevel = MembershipLevel.SILVER;
        } else {
            membershipLevel = MembershipLevel.BRONZE;
        }
    }
    
    public boolean canPurchase(BigDecimal amount) {
        return amount.compareTo(creditLimit) <= 0;
    }
    
    private String generateCustomerCode() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%04d", new Random().nextInt(10000));
        return "CUST-" + date + "-" + random;
    }
    
    // Getters and Setters
    // ... (all getters and setters)
}
```

---

## 16. CustomerType.java (Enum)

```java
public enum CustomerType {
    INDIVIDUAL("Individual Customer"),
    COMPANY("Company/Business");
    
    private final String description;
    
    CustomerType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
```

---

## 17. MembershipLevel.java (Enum)

```java
public enum MembershipLevel {
    BRONZE(0, 0),
    SILVER(1000, 5),
    GOLD(5000, 10),
    PLATINUM(10000, 15);
    
    private final int minPoints;
    private final int discountPercentage;
    
    MembershipLevel(int minPoints, int discountPercentage) {
        this.minPoints = minPoints;
        this.discountPercentage = discountPercentage;
    }
    
    public int getMinPoints() {
        return minPoints;
    }
    
    public int getDiscountPercentage() {
        return discountPercentage;
    }
    
    public static MembershipLevel fromPoints(int points) {
        if (points >= PLATINUM.minPoints) return PLATINUM;
        if (points >= GOLD.minPoints) return GOLD;
        if (points >= SILVER.minPoints) return SILVER;
        return BRONZE;
    }
}
```

---

## 18. Employee.java (Entity Code)

```java
@Entity
@Table(name = "employees")
public class Employee {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;
    
    @Column(name = "employee_code", unique = true, nullable = false, length = 20)
    private String employeeCode;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Department department;
    
    @Column(length = 100)
    private String position;
    
    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal salary;
    
    @Column(name = "commission_rate", precision = 5, scale = 2)
    private BigDecimal commissionRate = BigDecimal.ZERO;
    
    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Employee manager;
    
    @OneToMany(mappedBy = "manager")
    private List<Employee> subordinates = new ArrayList<>();
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (employeeCode == null) {
            employeeCode = generateEmployeeCode();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper methods
    public List<Employee> getAllSubordinates() {
        List<Employee> allSubs = new ArrayList<>();
        for (Employee sub : subordinates) {
            allSubs.add(sub);
            allSubs.addAll(sub.getAllSubordinates());
        }
        return allSubs;
    }
    
    public boolean isManagerOf(Employee employee) {
        return subordinates.contains(employee) || 
               subordinates.stream().anyMatch(sub -> sub.isManagerOf(employee));
    }
    
    public BigDecimal calculateCommission(BigDecimal orderAmount) {
        return orderAmount.multiply(commissionRate)
                         .divide(BigDecimal.valueOf(100));
    }
    
    public int getYearsOfService() {
        return Period.between(hireDate, LocalDate.now()).getYears();
    }
    
    private String generateEmployeeCode() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%04d", new Random().nextInt(10000));
        return "EMP-" + date + "-" + random;
    }
    
    // Getters and Setters
    // ... (all getters and setters)
}
```

---

## 19. Department.java (Enum)

```java
public enum Department {
    SALES("Sales Department"),
    OPERATIONS("Operations Department"),
    FINANCE("Finance Department"),
    CUSTOMER_SERVICE("Customer Service Department"),
    ADMINISTRATION("Administration Department"),
    IT("Information Technology Department");
    
    private final String description;
    
    Department(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
```

---

## 20. Validation Rules Summary

### User Validation:
```java
@Entity
@Table(name = "users")
public class User {
    
    @NotBlank(message = "Username is required")
    @Size(min = 6, max = 50, message = "Username must be between 6 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscore")
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100)
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", 
             message = "Password must contain uppercase, lowercase and number")
    private String password;
    
    @Pattern(regexp = "^[0-9+\\-\\s()]+$", message = "Invalid phone format")
    private String phone;
}
```

### Customer Validation:
```java
@Entity
@Table(name = "customers")
public class Customer {
    
    @AssertTrue(message = "Company name and tax code are required for COMPANY type")
    public boolean isValidCompanyInfo() {
        if (customerType == CustomerType.COMPANY) {
            return companyName != null && !companyName.isEmpty() 
                && taxCode != null && !taxCode.isEmpty();
        }
        return true;
    }
    
    @Min(value = 0, message = "Loyalty points cannot be negative")
    private Integer loyaltyPoints;
    
    @DecimalMin(value = "0.0", message = "Credit limit cannot be negative")
    private BigDecimal creditLimit;
}
```

### Employee Validation:
```java
@Entity
@Table(name = "employees")
public class Employee {
    
    @PastOrPresent(message = "Hire date cannot be in the future")
    private LocalDate hireDate;
    
    @DecimalMin(value = "0.0", message = "Salary cannot be negative")
    private BigDecimal salary;
    
    @DecimalMin(value = "0.0", message = "Commission rate cannot be negative")
    @DecimalMax(value = "100.0", message = "Commission rate cannot exceed 100%")
    private BigDecimal commissionRate;
    
    @AssertTrue(message = "Employee cannot be their own manager")
    public boolean isValidManager() {
        return manager == null || !manager.getId().equals(this.id);
    }
}
```

---

## 21. Service Layer - Role Group Validation

### RoleValidationService.java

```java
@Service
public class RoleValidationService {
    
    /**
     * Kiểm tra xem có thể gán role cho user không
     * Không cho phép mix INTERNAL và EXTERNAL roles
     */
    public void validateRoleAssignment(User user, Role newRole) {
        if (user.getRoles().isEmpty()) {
            // User chưa có role nào, cho phép gán
            return;
        }
        
        RoleGroup currentGroup = user.getRoleGroup();
        RoleGroup newGroup = newRole.getRoleGroup();
        
        if (currentGroup != newGroup) {
            throw new RoleGroupConflictException(
                String.format("Cannot assign %s role to user with %s roles. " +
                            "User can only have roles from one group (INTERNAL or EXTERNAL).",
                            newGroup, currentGroup)
            );
        }
    }
    
    /**
     * Kiểm tra xem user có thể chuyển sang role mới không
     */
    public void validateRoleSwitch(User user, Role newRole) {
        RoleGroup currentGroup = user.getRoleGroup();
        RoleGroup newGroup = newRole.getRoleGroup();
        
        if (currentGroup != null && currentGroup != newGroup) {
            throw new RoleGroupConflictException(
                String.format("Cannot switch from %s to %s role group. " +
                            "Please remove all current roles first.",
                            currentGroup, newGroup)
            );
        }
    }
    
    /**
     * Lấy danh sách roles được phép gán cho user
     */
    public List<Role> getAllowedRoles(User user, List<Role> allRoles) {
        if (user.getRoles().isEmpty()) {
            // User chưa có role, cho phép tất cả
            return allRoles;
        }
        
        RoleGroup userGroup = user.getRoleGroup();
        return allRoles.stream()
            .filter(role -> role.getRoleGroup() == userGroup)
            .collect(Collectors.toList());
    }
}
```

---

## 22. Exception Classes

### RoleGroupConflictException.java
```java
public class RoleGroupConflictException extends RuntimeException {
    public RoleGroupConflictException(String message) {
        super(message);
    }
}
```

### UserNotFoundException.java
```java
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
```

### RoleNotFoundException.java
```java
public class RoleNotFoundException extends RuntimeException {
    public RoleNotFoundException(String message) {
        super(message);
    }
}
```

---

## 23. Testing Scenarios

### Valid Scenarios:
```java
// ✅ User có ADMIN role
User admin = new User();
admin.addRole(roleAdmin);  // INTERNAL

// ✅ User có EMPLOYEE role
User emp = new User();
emp.addRole(roleEmployee);  // INTERNAL

// ✅ User có CUSTOMER role
User customer = new User();
customer.addRole(roleCustomer);  // EXTERNAL

// ✅ User có cả ADMIN và EMPLOYEE (cùng INTERNAL group)
User superUser = new User();
superUser.addRole(roleAdmin);
superUser.addRole(roleEmployee);  // OK - cùng group
```

### Invalid Scenarios:
```java
// ❌ User có ADMIN và CUSTOMER (khác group)
User invalid1 = new User();
invalid1.addRole(roleAdmin);     // INTERNAL
invalid1.addRole(roleCustomer);  // EXTERNAL - CONFLICT!

// ❌ User có EMPLOYEE và CUSTOMER (khác group)
User invalid2 = new User();
invalid2.addRole(roleEmployee);  // INTERNAL
invalid2.addRole(roleCustomer);  // EXTERNAL - CONFLICT!
```

---

## 24. Next Steps

### Implementation Order:
1. ✅ Create enums (RoleGroup, CustomerType, MembershipLevel, Department)
2. ✅ Create base entities (User, Role)
3. ✅ Create extended entities (Customer, Employee)
4. Create repositories
5. Create validation service
6. Create user service
7. Create exception handlers
8. Write unit tests
9. Write integration tests

### Files to Create:
1. `RoleGroup.java` - enum
2. `CustomerType.java` - enum
3. `MembershipLevel.java` - enum
4. `Department.java` - enum
5. `User.java` - entity
6. `Role.java` - entity
7. `Customer.java` - entity
8. `Employee.java` - entity
9. `UserRepository.java` - repository
10. `RoleRepository.java` - repository
11. `CustomerRepository.java` - repository
12. `EmployeeRepository.java` - repository
13. `RoleValidationService.java` - service
14. Exceptions

---

**Document Status**: Ready for Implementation  
**Next Action**: Start creating enum classes

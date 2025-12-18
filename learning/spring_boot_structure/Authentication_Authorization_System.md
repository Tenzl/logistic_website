# Authentication & Authorization System - Login/Logout Structure

## Tổng Quan

Hệ thống xác thực sử dụng **Servlet Filters** để:
- ✅ Kiểm tra authentication (đã đăng nhập chưa)
- ✅ Kiểm tra authorization (có quyền admin không)
- ✅ Redirect về trang login nếu chưa đăng nhập
- ✅ Chặn non-admin users từ các admin actions

---

## 1. Session Management Architecture

### Session Storage
```java
// Session attributes
session.setAttribute("user", userDTO);           // User object
session.setAttribute("userId", user.getId());    // User ID
session.setAttribute("username", user.getUsername());
session.setAttribute("roles", user.getRoles());  // Set<String>
session.setAttribute("roleGroup", user.getRoleGroup());
```

### Session Flow
```
1. User login → Create session → Store user info
2. Every request → Filter checks session → Allow/Deny
3. User logout → Invalidate session → Redirect to login
```

---

## 2. File Structure

```
src/main/java/com/example/seatrans/
├── filter/
│   ├── AuthFilter.java          # Authentication filter
│   └── AdminFilter.java         # Authorization filter (Admin only)
├── controller/
│   ├── AuthController.java      # Login/Logout/Register endpoints
│   └── ... (other controllers)
└── dto/
    └── UserDTO.java
```

---

## 3. AuthFilter.java - Authentication Filter

### Purpose:
- Kiểm tra user đã đăng nhập chưa
- Allow public URLs (login, register, static files)
- Redirect to login page nếu chưa authenticated

### Implementation:

```java
package com.example.seatrans.filter;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Filter kiểm tra authentication cho tất cả requests
 * Redirect về login page nếu user chưa đăng nhập
 */
@WebFilter("/*")
public class AuthFilter implements Filter {
    
    // Danh sách URLs không cần authentication
    private static final List<String> PUBLIC_URLS = Arrays.asList(
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/register/customer",
        "/login",
        "/register",
        "/css/",
        "/js/",
        "/images/",
        "/favicon.ico"
    );
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String requestURI = httpRequest.getRequestURI();
        String contextPath = httpRequest.getContextPath();
        String path = requestURI.substring(contextPath.length());
        
        // Check nếu là public URL
        if (isPublicURL(path)) {
            chain.doFilter(request, response);
            return;
        }
        
        // Check session
        HttpSession session = httpRequest.getSession(false);
        boolean isLoggedIn = (session != null && session.getAttribute("user") != null);
        
        if (isLoggedIn) {
            // User đã login, cho phép request tiếp tục
            chain.doFilter(request, response);
        } else {
            // User chưa login
            if (isAPIRequest(path)) {
                // API request → trả về 401 Unauthorized
                httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                httpResponse.setContentType("application/json");
                httpResponse.getWriter().write(
                    "{\"success\":false,\"message\":\"Authentication required. Please login.\"}"
                );
            } else {
                // Web page request → redirect to login
                httpResponse.sendRedirect(contextPath + "/login");
            }
        }
    }
    
    /**
     * Kiểm tra URL có phải public không
     */
    private boolean isPublicURL(String path) {
        return PUBLIC_URLS.stream().anyMatch(path::startsWith);
    }
    
    /**
     * Kiểm tra có phải API request không
     */
    private boolean isAPIRequest(String path) {
        return path.startsWith("/api/");
    }
    
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Initialization code if needed
    }
    
    @Override
    public void destroy() {
        // Cleanup code if needed
    }
}
```

### Key Features:
- ✅ `@WebFilter("/*")` - Apply cho tất cả URLs
- ✅ Public URLs bypass authentication
- ✅ API requests trả về JSON error 401
- ✅ Web pages redirect về `/login`
- ✅ Check session attribute `"user"`

---

## 4. AdminFilter.java - Authorization Filter

### Purpose:
- Kiểm tra user có role ADMIN không
- Chặn non-admin từ create/edit/delete operations
- Only allow admin cho specific endpoints

### Implementation:

```java
package com.example.seatrans.filter;

import com.example.seatrans.dto.UserDTO;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Set;

/**
 * Filter kiểm tra admin authorization cho admin-only endpoints
 * Chặn non-admin users từ các operations quan trọng
 */
@WebFilter(urlPatterns = {
    "/api/users/*",
    "/api/employees/*/activate",
    "/api/employees/*/deactivate",
    "/api/customers/*/credit-limit",
    "/admin/*"
})
public class AdminFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String method = httpRequest.getMethod();
        String path = httpRequest.getRequestURI();
        
        // Check nếu là admin operation
        if (isAdminOperation(method, path)) {
            HttpSession session = httpRequest.getSession(false);
            
            if (session == null || session.getAttribute("user") == null) {
                // Not logged in
                sendUnauthorizedResponse(httpResponse, "Authentication required");
                return;
            }
            
            UserDTO user = (UserDTO) session.getAttribute("user");
            
            if (!isAdmin(user)) {
                // Not admin
                sendForbiddenResponse(httpResponse, "Admin access required. You do not have permission to perform this action.");
                return;
            }
        }
        
        // Admin hoặc không phải admin operation → cho phép
        chain.doFilter(request, response);
    }
    
    /**
     * Kiểm tra operation có cần admin không
     */
    private boolean isAdminOperation(String method, String path) {
        // POST, PUT, DELETE operations cần admin
        if (method.equals("POST") || method.equals("PUT") || method.equals("DELETE")) {
            return true;
        }
        
        // Specific admin paths
        if (path.contains("/admin/") || 
            path.contains("/activate") || 
            path.contains("/deactivate") ||
            path.contains("/credit-limit") ||
            path.contains("/users/") && method.equals("DELETE")) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Kiểm tra user có phải admin không
     */
    private boolean isAdmin(UserDTO user) {
        if (user == null || user.getRoles() == null) {
            return false;
        }
        
        Set<String> roles = user.getRoles();
        return roles.contains("ROLE_ADMIN");
    }
    
    /**
     * Trả về 401 Unauthorized
     */
    private void sendUnauthorizedResponse(HttpServletResponse response, String message) 
            throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write(
            "{\"success\":false,\"message\":\"" + message + "\"}"
        );
    }
    
    /**
     * Trả về 403 Forbidden
     */
    private void sendForbiddenResponse(HttpServletResponse response, String message) 
            throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write(
            "{\"success\":false,\"message\":\"" + message + "\"}"
        );
    }
    
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Initialization
    }
    
    @Override
    public void destroy() {
        // Cleanup
    }
}
```

### Key Features:
- ✅ `@WebFilter(urlPatterns = {...})` - Specific URLs only
- ✅ Check HTTP methods: POST, PUT, DELETE cần admin
- ✅ Check user roles từ session
- ✅ Return 403 Forbidden nếu không phải admin
- ✅ Detailed error messages

---

## 5. Updated AuthController.java - Login/Logout

### Add Login/Logout với Session Management:

```java
package com.example.seatrans.controller;

import com.example.seatrans.dto.*;
import com.example.seatrans.entity.UserManagement.User;
import com.example.seatrans.mapper.EntityMapper;
import com.example.seatrans.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {
    
    private final UserService userService;
    private final EntityMapper entityMapper;
    
    /**
     * POST /api/auth/login
     * Đăng nhập và tạo session
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserDTO>> login(
            @Valid @RequestBody LoginDTO loginDTO,
            HttpSession session) {
        
        // Verify credentials
        boolean isValid = userService.verifyCredentials(
            loginDTO.getUsername(), 
            loginDTO.getPassword()
        );
        
        if (!isValid) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid username or password"));
        }
        
        // Lấy user info
        User user = userService.getUserByUsername(loginDTO.getUsername());
        
        // Update last login
        userService.updateLastLogin(user.getId());
        
        // Convert sang DTO
        UserDTO userDTO = entityMapper.toUserDTO(user);
        
        // ===== CREATE SESSION =====
        session.setAttribute("user", userDTO);
        session.setAttribute("userId", user.getId());
        session.setAttribute("username", user.getUsername());
        session.setAttribute("roles", user.getRoleNames());
        session.setAttribute("roleGroup", user.getRoleGroup());
        
        // Set session timeout (30 minutes)
        session.setMaxInactiveInterval(30 * 60);
        
        return ResponseEntity.ok(
            ApiResponse.success("Login successful", userDTO)
        );
    }
    
    /**
     * POST /api/auth/logout
     * Đăng xuất và xóa session
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpSession session) {
        // Invalidate session
        if (session != null) {
            session.invalidate();
        }
        
        return ResponseEntity.ok(
            ApiResponse.success("Logout successful", null)
        );
    }
    
    /**
     * GET /api/auth/current-user
     * Lấy thông tin user hiện tại từ session
     */
    @GetMapping("/current-user")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(HttpSession session) {
        UserDTO user = (UserDTO) session.getAttribute("user");
        
        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not logged in"));
        }
        
        return ResponseEntity.ok(
            ApiResponse.success("Current user", user)
        );
    }
    
    /**
     * POST /api/auth/register
     * Đăng ký user mới (không tạo session)
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDTO>> register(
            @Valid @RequestBody RegisterDTO registerDTO) {
        
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(registerDTO.getPassword());
        user.setFullName(registerDTO.getFullName());
        user.setPhone(registerDTO.getPhone());
        
        User createdUser = userService.createUser(user);
        UserDTO userDTO = entityMapper.toUserDTO(createdUser);
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", userDTO));
    }
    
    /**
     * POST /api/auth/register/customer
     * Đăng ký customer và auto login
     */
    @PostMapping("/register/customer")
    public ResponseEntity<ApiResponse<UserDTO>> registerCustomer(
            @Valid @RequestBody RegisterDTO registerDTO,
            HttpSession session) {
        
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(registerDTO.getPassword());
        user.setFullName(registerDTO.getFullName());
        user.setPhone(registerDTO.getPhone());
        
        // Tạo user với ROLE_CUSTOMER
        User createdUser = userService.createUserWithRoles(user, Set.of("ROLE_CUSTOMER"));
        UserDTO userDTO = entityMapper.toUserDTO(createdUser);
        
        // Auto login after registration
        session.setAttribute("user", userDTO);
        session.setAttribute("userId", createdUser.getId());
        session.setAttribute("username", createdUser.getUsername());
        session.setAttribute("roles", createdUser.getRoleNames());
        session.setAttribute("roleGroup", createdUser.getRoleGroup());
        session.setMaxInactiveInterval(30 * 60);
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer registered and logged in", userDTO));
    }
    
    /**
     * POST /api/auth/change-password
     * Đổi password (cần đã login)
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordDTO changePasswordDTO,
            HttpSession session) {
        
        // Get current user from session
        Long userId = (Long) session.getAttribute("userId");
        
        if (userId == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not logged in"));
        }
        
        userService.changePassword(
                userId, 
                changePasswordDTO.getOldPassword(), 
                changePasswordDTO.getNewPassword()
        );
        
        return ResponseEntity.ok(
            ApiResponse.success("Password changed successfully", null)
        );
    }
}
```

---

## 6. Filter Registration (SeatransApplication.java)

### Enable Servlet Components:

```java
package com.example.seatrans;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;

@SpringBootApplication
@ServletComponentScan  // <-- Enable @WebFilter scanning
public class SeatransApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(SeatransApplication.class, args);
    }
}
```

---

## 7. Testing Flow

### Test 1: Login Flow
```http
# 1. Login
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123"
}

# Response sẽ set session cookie
# Save cookie từ response header: Set-Cookie: JSESSIONID=...
```

### Test 2: Access Protected Endpoint
```http
# 2. Get current user (dùng session cookie)
GET http://localhost:8080/api/auth/current-user
Cookie: JSESSIONID=<your-session-id>

# Response:
{
  "success": true,
  "message": "Current user",
  "data": {
    "id": 1,
    "username": "admin",
    "roles": ["ROLE_ADMIN"]
  }
}
```

### Test 3: Admin Operation
```http
# 3. Create user (cần ROLE_ADMIN)
POST http://localhost:8080/api/users/1/roles?roleName=ROLE_EMPLOYEE
Cookie: JSESSIONID=<your-session-id>

# ✅ If admin: Success
# ❌ If not admin: 403 Forbidden
```

### Test 4: Logout
```http
# 4. Logout
POST http://localhost:8080/api/auth/logout
Cookie: JSESSIONID=<your-session-id>

# Session invalidated
```

### Test 5: Access After Logout
```http
# 5. Try to access protected endpoint
GET http://localhost:8080/api/auth/current-user

# Response: 401 Unauthorized (no session)
```

---

## 8. Postman Configuration

### Enable Cookie Handling:
1. Postman → Settings → General
2. ✅ Enable "Automatically follow redirects"
3. ✅ Enable "Send cookies"

### Save Session Cookie:
```javascript
// In Postman Tests tab (for login request)
pm.test("Save session cookie", function() {
    var cookies = pm.cookies.get("JSESSIONID");
    pm.environment.set("sessionId", cookies);
});
```

### Use Session Cookie:
```http
GET http://localhost:8080/api/auth/current-user
Cookie: JSESSIONID={{sessionId}}
```

---

## 9. Error Responses

### 401 Unauthorized (Not logged in)
```json
{
  "success": false,
  "message": "Authentication required. Please login."
}
```

### 403 Forbidden (Not admin)
```json
{
  "success": false,
  "message": "Admin access required. You do not have permission to perform this action."
}
```

### Invalid credentials
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

---

## 10. Security Best Practices

### Session Configuration (application.properties)
```properties
# Session timeout (30 minutes)
server.servlet.session.timeout=30m

# Session cookie config
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=false
server.servlet.session.cookie.same-site=lax

# Enable session persistence
spring.session.store-type=none
```

### Password Security
- ✅ BCrypt hashing (already implemented)
- ✅ Password validation (min 8 chars, uppercase, lowercase, number)
- ✅ Never return password in responses

### CSRF Protection (for production)
```java
// Add to SecurityConfig later
@Bean
public CsrfTokenRepository csrfTokenRepository() {
    return CookieCsrfTokenRepository.withHttpOnlyFalse();
}
```

---

## 11. Implementation Checklist

### Phase 1: Basic Auth
- [x] AuthFilter - Authentication check
- [x] Login endpoint with session
- [x] Logout endpoint
- [x] Current user endpoint

### Phase 2: Admin Auth
- [x] AdminFilter - Authorization check
- [x] Role-based access control
- [x] Error handling

### Phase 3: Testing
- [ ] Test login flow
- [ ] Test admin operations
- [ ] Test non-admin blocked
- [ ] Test logout

### Phase 4: Security Hardening
- [ ] HTTPS in production
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Session fixation protection

---

## 12. Next Steps

1. **Implement Filters:**
   - Create `AuthFilter.java`
   - Create `AdminFilter.java`
   - Add `@ServletComponentScan` to main class

2. **Update AuthController:**
   - Add session management to login
   - Add logout endpoint
   - Add current-user endpoint

3. **Test in Postman:**
   - Test login → save session
   - Test protected endpoints
   - Test admin operations
   - Test logout

4. **Add Frontend (optional):**
   - Login page (HTML/Thymeleaf)
   - Logout button
   - Display current user info
   - Redirect on auth errors

---

**Document Status:** Ready for Implementation  
**Priority:** HIGH - Core authentication system  
**Estimated Time:** 2-3 hours implementation + testing

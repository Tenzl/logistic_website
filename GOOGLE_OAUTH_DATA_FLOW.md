# Google OAuth2 - Data Flow & Database Storage

## 🔐 Google OAuth2 trả về gì?

### 1. **Authorization Code** (Bước đầu)
Khi user đăng nhập thành công, Google redirect về backend với `code`:
```
http://localhost:8080/api/auth/oauth2/callback/google?code=4/0AeanSxQk...
```

### 2. **Access Token** (Backend exchange code)
Backend sử dụng `code` để đổi lấy Access Token từ Google:

**Request:**
```json
POST https://oauth2.googleapis.com/token
{
  "code": "4/0AeanSxQk...",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "redirect_uri": "http://localhost:8080/api/auth/oauth2/callback/google",
  "grant_type": "authorization_code"
}
```

**Response từ Google:**
```json
{
  "access_token": "ya29.a0AfB_byB...",
  "expires_in": 3599,
  "scope": "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
  "token_type": "Bearer",
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

### 3. **User Info** (Backend fetch từ Google)
Backend dùng `access_token` để lấy thông tin user:

**Request:**
```
GET https://www.googleapis.com/oauth2/v3/userinfo
Authorization: Bearer ya29.a0AfB_byB...
```

**Response từ Google:**
```json
{
  "sub": "108574225656294717634",
  "name": "Nguyễn Văn A",
  "given_name": "A",
  "family_name": "Nguyễn",
  "picture": "https://lh3.googleusercontent.com/a/...",
  "email": "nguyenvana@gmail.com",
  "email_verified": true,
  "locale": "vi"
}
```

**Giải thích các trường:**
- `sub`: Google User ID (unique identifier) - **ĐÂY LÀ ID QUAN TRỌNG NHẤT**
- `name`: Tên đầy đủ
- `email`: Email đã xác thực
- `email_verified`: Luôn là `true` vì Google đã verify
- `picture`: Avatar URL
- `given_name`: Tên
- `family_name`: Họ

---

## 💾 Lưu vào Database như thế nào?

### Schema Database

Bảng `users` có cấu trúc:

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    company VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- OAuth2 Fields (MỚI THÊM)
    oauth_provider VARCHAR(50),        -- 'google', 'facebook', etc.
    oauth_provider_id VARCHAR(255),    -- Google 'sub' field
    email_verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX idx_oauth_provider ON users(oauth_provider, oauth_provider_id);
```

### Logic Lưu User (trong `UserService.findOrCreateOAuthUser()`)

#### **Case 1: User chưa tồn tại → TẠO MỚI**

```java
// Data từ Google
String email = "nguyenvana@gmail.com";
String fullName = "Nguyễn Văn A";
String provider = "google";
String providerId = "108574225656294717634"; // Google 'sub'

// Tạo user mới
User newUser = new User();
newUser.setEmail(email);                          // nguyenvana@gmail.com
newUser.setFullName(fullName);                    // Nguyễn Văn A
newUser.setUsername(email);                       // nguyenvana@gmail.com (dùng email làm username)
newUser.setPassword(encodedRandomPassword);       // Random password (user không cần biết)
newUser.setIsActive(true);                        // Active ngay
newUser.setEmailVerified(true);                   // Google đã verify
newUser.setOauthProvider("google");               // Lưu provider
newUser.setOauthProviderId("108574...634");       // Lưu Google ID
newUser.setRoles([ROLE_CUSTOMER]);                // Gán role customer

userRepository.save(newUser);
```

**Kết quả trong database:**
```
| id | email                  | full_name     | oauth_provider | oauth_provider_id    | email_verified | roles         |
|----|------------------------|---------------|----------------|----------------------|----------------|---------------|
| 15 | nguyenvana@gmail.com   | Nguyễn Văn A  | google         | 108574225656294717634| true           | ROLE_CUSTOMER |
```

#### **Case 2: User đã signup bằng email/password, sau đó login Google → LINK OAUTH** ⭐

**Scenario:** User đã đăng ký tài khoản với `nguyenvana@gmail.com` và password `MyPassword123`, sau đó họ thử login bằng Google với cùng email đó.

**Câu hỏi:** Có tạo user mới không? Hay dùng account cũ?

**Trả lời:** Hệ thống sẽ **LINK OAUTH VÀO ACCOUNT CŨ**, không tạo user mới!

```java
// Logic trong UserService.findOrCreateOAuthUser()
Optional<User> existingByEmail = userRepository.findByEmail(email);
if (existingByEmail.isPresent()) {
    User user = existingByEmail.get();
    // Link OAuth provider vào tài khoản hiện tại
    user.setOauthProvider("google");
    user.setOauthProviderId("108574...634");
    user.setEmailVerified(true);
    return userRepository.save(user);
}
```

**Database TRƯỚC khi login Google:**
```
| id | email                | password    | oauth_provider | oauth_provider_id | email_verified |
|----|---------------------|-------------|----------------|-------------------|----------------|
| 10 | nguyenvana@gmail.com| $2a$10$...  | NULL           | NULL              | false          |
```

**Database SAU khi login Google:**
```
| id | email                | password    | oauth_provider | oauth_provider_id    | email_verified |
|----|---------------------|-------------|----------------|----------------------|----------------|
| 10 | nguyenvana@gmail.com| $2a$10$...  | google         | 108574225656294717634| true           |
```

**Lợi ích:**
1. ✅ **User giữ nguyên data**: History, orders, preferences vẫn còn
2. ✅ **Login 2 cách**: Có thể dùng email/password HOẶC Google (tùy thích)
3. ✅ **Email verified**: Tự động đánh dấu email đã xác thực (vì Google verify rồi)
4. ✅ **Không duplicate**: Không tạo 2 accounts với cùng email

**User Experience:**

```
Bước 1: User signup
  ├─ Email: nguyenvana@gmail.com
  ├─ Password: MyPassword123
  └─ Account ID: 10 created ✓

Bước 2: Sau đó user thử login Google
  ├─ Google email: nguyenvana@gmail.com (trùng!)
  ├─ System nhận ra: Email này đã có account!
  ├─ Action: Link OAuth info vào account #10
  └─ Result: User login thành công với account cũ ✓

Bước 3: Từ giờ user có thể:
  ├─ Login bằng email/password (MyPassword123)
  │   └─ POST /api/auth/login
  │
  └─ Login bằng Google (1 click, không cần password)
      └─ GET /api/auth/oauth2/google
```

**Security Note:**
- Password gốc vẫn hoạt động → User có thể đổi password nếu muốn
- Nếu user quên password → Có thể login Google thay thế
- Nếu Google account bị khóa → Vẫn login được bằng password

#### **Case 3: User đã login Google trước đó → TÌM VÀ TRẢ VỀ**

```java
Optional<User> existingByProvider = userRepository.findByOauthProviderAndOauthProviderId("google", providerId);
if (existingByProvider.isPresent()) {
    return existingByProvider.get(); // Trả về user hiện tại
}
```

Tìm user theo `oauth_provider_id` (chính xác nhất) thay vì chỉ email.

---

## 🔄 Flow Hoàn Chỉnh

```
1. User click "Login with Google"
   ↓
2. Frontend redirect đến Google login page
   ↓
3. User đăng nhập Google và cho phép quyền
   ↓
4. Google redirect về: /api/auth/oauth2/callback/google?code=...
   ↓
5. Backend exchange code → access_token
   ↓
6. Backend dùng access_token → fetch user info từ Google API
   ↓
7. Backend nhận được:
   {
     "sub": "108574225656294717634",
     "email": "nguyenvana@gmail.com",
     "name": "Nguyễn Văn A",
     "email_verified": true
   }
   ↓
8. Backend check database:
   - Có user với oauth_provider_id này? → Dùng user đó
   - Không có, nhưng có email trùng? → Link OAuth vào account cũ
   - Không có gì? → Tạo user mới
   ↓
9. Backend lưu/update user trong database
   ↓
10. Backend generate JWT token cho user
   ↓
11. Backend redirect về frontend: /auth/callback?token=...&refreshToken=...
   ↓
12. Frontend lưu tokens vào localStorage
   ↓
13. User đã đăng nhập! 🎉
```

---

## 🎯 Lợi Ích của OAuth Provider ID

### Tại sao lưu `oauth_provider_id`?

1. **Unique Identifier**: Email có thể đổi, nhưng Google `sub` không bao giờ đổi
2. **Tìm nhanh**: Query theo `oauth_provider_id` nhanh hơn và chính xác hơn
3. **Multi-Provider**: Có thể link nhiều OAuth provider (Google, Facebook) vào 1 account
4. **Security**: Không bị conflict nếu 2 provider có cùng email (hiếm nhưng có thể)

### Example: User có nhiều OAuth providers

```sql
-- User có thể link cả Google và Facebook
| id | email          | oauth_provider | oauth_provider_id    |
|----|---------------|----------------|----------------------|
| 20 | user@gmail.com| google         | 108574225656294717634|

-- Sau này thêm Facebook (cần mở rộng schema cho multi-provider)
-- Có thể dùng bảng user_oauth_providers riêng
```

---

## � Ví Dụ Thực Tế: Hành Trình Của User "Nguyễn Văn A"

### **Timeline:**

```
📅 Ngày 1: Signup bằng Email/Password
───────────────────────────────────────
User: "Tôi muốn tạo tài khoản"
System: "Nhập email và password"

Input:
  ✉️ Email: nguyenvana@gmail.com
  🔒 Password: MySecurePass123
  👤 Full Name: Nguyễn Văn A

Database:
  | id | email                | password         | oauth_provider | oauth_provider_id | email_verified |
  |----|---------------------|------------------|----------------|-------------------|----------------|
  | 50 | nguyenvana@gmail.com| $2a$10$hashed... | NULL           | NULL              | false          |

Result: ✅ Account created! User ID = 50


📅 Ngày 5: User quên mật khẩu, thử login Google
────────────────────────────────────────────────
User: "Mình quên mật khẩu rồi, thử login Google xem sao"
System: "Redirecting to Google..."

Google returns:
  {
    "sub": "108574225656294717634",
    "email": "nguyenvana@gmail.com",  ← Trùng với account đã có!
    "name": "Nguyễn Văn A",
    "email_verified": true
  }

System logic:
  1. Check: Có user với oauth_provider_id này không? → KHÔNG
  2. Check: Có user với email này không? → CÓ! (User #50)
  3. Action: Link OAuth vào User #50

Database AFTER:
  | id | email                | password         | oauth_provider | oauth_provider_id    | email_verified |
  |----|---------------------|------------------|----------------|----------------------|----------------|
  | 50 | nguyenvana@gmail.com| $2a$10$hashed... | google         | 108574225656294717634| true ⬆️        |
                                                     ⬆️ Updated      ⬆️ Updated            ⬆️ Updated

Result: ✅ Login successful! User ID = 50 (same account)


📅 Ngày 10: User login lần nữa (chọn Google)
──────────────────────────────────────────────
User: "Click nút Login with Google"

System:
  1. Check: oauth_provider_id = "108574225656294717634" → Có User #50
  2. Return: User #50

Result: ✅ Login instantly! No password needed


📅 Ngày 15: User nhớ lại password cũ
──────────────────────────────────────
User: "À tôi nhớ ra password rồi, thử login bằng password xem"

POST /api/auth/login
{
  "username": "nguyenvana@gmail.com",
  "password": "MySecurePass123"  ← Password gốc vẫn hoạt động!
}

Result: ✅ Login successful! User ID = 50 (vẫn cùng account)


📅 Summary: User có 2 cách login
─────────────────────────────────
Option 1: Email/Password
  → POST /api/auth/login
  → Password: MySecurePass123
  
Option 2: Google OAuth
  → Click "Login with Google"
  → No password needed
  → Faster & more secure

Cả 2 cách đều vào CÙNG 1 ACCOUNT (User #50)
Data không bị duplicate, history được giữ nguyên! 🎉
```

---

## �🛡️ Security Notes

1. **Password**: User OAuth có random password, họ không thể login bằng password
2. **Email Verified**: OAuth users có `email_verified = true` vì provider đã verify
3. **Provider ID**: Lưu Google `sub` để tìm user chính xác, không phụ thuộc email
4. **Token**: Backend tạo JWT token riêng của hệ thống, không dùng Google token

---

## 📝 Migration SQL

Để thêm OAuth fields vào database hiện tại:

```sql
ALTER TABLE users 
ADD COLUMN oauth_provider VARCHAR(50),
ADD COLUMN oauth_provider_id VARCHAR(255),
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_oauth_provider ON users(oauth_provider, oauth_provider_id);

-- Update existing users to have email_verified = true if they already verified
UPDATE users SET email_verified = TRUE WHERE is_active = TRUE;
```

---

## 🧪 Test Cases

### Test 1: Đăng nhập Google lần đầu (User chưa có trong hệ thống)
- **Input**: User click "Login with Google" → Email `newuser@gmail.com`
- **Expected**: 
  - Tạo user mới với `oauth_provider = 'google'`
  - `oauth_provider_id = '108574225656294717634'`
  - `email_verified = true`
  - Role: `ROLE_CUSTOMER`
- **SQL Result**:
  ```sql
  INSERT INTO users (email, full_name, oauth_provider, oauth_provider_id, email_verified)
  VALUES ('newuser@gmail.com', 'New User', 'google', '108574225656294717634', true);
  ```

### Test 2: Signup bằng email trước, sau đó login Google ⭐ (QUAN TRỌNG)
- **Setup**: 
  ```sql
  -- User đã signup trước đó
  INSERT INTO users (email, password, full_name, email_verified)
  VALUES ('test@gmail.com', '$2a$10$hashed...', 'Test User', false);
  ```
- **Action**: User click "Login with Google" → Email `test@gmail.com` (trùng!)
- **Expected**: 
  - **KHÔNG tạo user mới**
  - Link OAuth vào account cũ
  - Update: `oauth_provider = 'google'`, `oauth_provider_id = '108574...'`, `email_verified = true`
- **SQL Result**:
  ```sql
  UPDATE users 
  SET oauth_provider = 'google',
      oauth_provider_id = '108574225656294717634',
      email_verified = true
  WHERE email = 'test@gmail.com';
  ```
- **Verification**:
  ```javascript
  // User có thể login 2 cách:
  
  // Cách 1: Email/Password (vẫn hoạt động)
  POST /api/auth/login
  {
    "username": "test@gmail.com",
    "password": "originalPassword123"
  }
  // ✓ Success
  
  // Cách 2: Google OAuth (mới thêm)
  GET /api/auth/oauth2/google
  // ✓ Success
  ```

### Test 3: Đăng nhập Google lần thứ 2 (User đã login Google trước đó)
- **Input**: User đã login Google rồi, lần này login lại
- **Expected**: 
  - Tìm user theo `oauth_provider_id` (chính xác nhất)
  - Login thành công ngay lập tức
  - Không update gì cả
- **Query**:
  ```sql
  SELECT * FROM users 
  WHERE oauth_provider = 'google' 
    AND oauth_provider_id = '108574225656294717634';
  ```

### Test 4: User đổi email trên Google
- **Scenario**: User login Google lần đầu với `old@gmail.com`, sau đó đổi email Google thành `new@gmail.com`
- **Input**: User login Google lần thứ 2
- **Expected**: 
  - Vẫn tìm được user vì dùng `oauth_provider_id` (không phụ thuộc email)
  - Có thể update email mới nếu muốn (tùy business logic)
- **Advantage**: System không bị ảnh hưởng khi user đổi email trên Google

### Test 5: Conflict - 2 users khác nhau signup cùng email
- **Scenario**: 
  - User A signup với `shared@gmail.com` + password
  - User B signup với `shared@gmail.com` qua Google
- **Expected**: 
  - User B login Google → Link vào account của User A (email trùng)
  - Cả 2 chia sẻ cùng 1 account
- **Note**: Nếu muốn tránh case này, cần thêm logic kiểm tra ownership (2FA, confirmation email, etc.)

### Test 6: User xóa OAuth link
- **Action**: Admin hoặc user muốn unlink Google account
- **SQL**:
  ```sql
  UPDATE users 
  SET oauth_provider = NULL,
      oauth_provider_id = NULL
  WHERE id = 10;
  ```
- **Result**: User chỉ login được bằng email/password, không thể login Google nữa

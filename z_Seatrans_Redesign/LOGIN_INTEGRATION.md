# Login Integration Guide

## Tích hợp hoàn tất ✓

Login system đã được gắn vào Seatrans Redesign với các tính năng sau:

### 1. **Architecture**
- **Service Layer**: `src/services/authService.ts` - xử lý API calls với backend
- **Context API**: `src/context/AuthContext.tsx` - quản lý auth state toàn ứng dụng
- **UI Component**: `src/components/Login.tsx` - form login với validation
- **Header Integration**: User dropdown khi đã login

### 2. **API Endpoints**

Backend endpoint để login:
```
POST http://localhost:8080/api/auth/login
```

Request body:
```json
{
  "username": "user@seatrans",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-123",
      "username": "user@seatrans",
      "fullName": "Nguyễn Văn A",
      "role": "CUSTOMER"
    }
  }
}
```

### 3. **Features Implemented**

✓ Username/Password login form
✓ Password toggle (show/hide)
✓ Remember me checkbox
✓ Error message display
✓ Loading state with spinner
✓ Token storage (localStorage)
✓ User info persistence
✓ Header user dropdown (shows fullName, @username, logout button)
✓ Auto-redirect to home after login
✓ Logout functionality
✓ Auth state persists on page reload

### 4. **File Structure**

```
z_Seatrans_Redesign/src/
├── services/
│   └── authService.ts          # API calls & token management
├── context/
│   └── AuthContext.tsx         # Auth state provider
├── components/
│   ├── Login.tsx               # Login form component
│   ├── Header.tsx              # Updated with user dropdown
│   └── App.tsx                 # Updated routing
└── main.tsx                     # Wrapped with AuthProvider
```

### 5. **Usage in Components**

Dùng `useAuth()` hook để truy cập auth state:

```typescript
import { useAuth } from '../context/AuthContext'

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()
  
  if (isAuthenticated) {
    return <p>Hello, {user?.fullName}!</p>
  }
  
  return <p>Please login</p>
}
```

### 6. **Backend Setup Requirements**

Backend cần có:

1. **Auth Controller** endpoint:
   ```java
   POST /api/auth/login
   ```

2. **LoginDTO** (đã có):
   ```java
   {
     username: String,
     password: String
   }
   ```

3. **JWT Token generation** (nếu backend sử dụng)

4. **User response DTO** với fields:
   - id
   - username
   - fullName
   - role
   - token

### 7. **Configuration**

API base URL: `http://localhost:8080/api`

Để thay đổi, sửa trong `authService.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8080/api'
```

### 8. **Testing**

1. Start backend: `./mvnw spring-boot:run`
2. Start frontend: `npm run dev` (trong z_Seatrans_Redesign)
3. Click "Login" button in header
4. Enter username/password
5. Nếu thành công: redirect home + user dropdown hiện
6. Click avatar dropdown để xem Logout

### 9. **Security Notes**

- Token lưu trong localStorage (không secure)
- Để production-ready, dùng HttpOnly cookie
- Thêm CORS configuration ở backend nếu cần
- Implement token refresh logic cho hết hạn

### 10. **Next Steps**

1. Test login endpoint từ backend
2. Thêm forgot password feature
3. Implement registration flow (Signup.tsx)
4. Thêm protected routes cho admin/user pages
5. Token refresh khi hết hạn

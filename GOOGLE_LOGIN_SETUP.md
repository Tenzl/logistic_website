# Google OAuth2 Login Setup Guide

## Hướng dẫn cấu hình Google Login

### Bước 1: Tạo Google OAuth2 Credentials

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Chọn **Web application**
6. Cấu hình:
   - **Name**: Seatrans Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
     - `http://localhost:8080`
   - **Authorized redirect URIs**:
     - `http://localhost:8080/api/auth/oauth2/callback/google`
7. Click **Create** và lưu lại **Client ID** và **Client Secret**

### Bước 2: Cấu hình Backend (Spring Boot)

Mở file `src/main/resources/application.properties` và cập nhật:

```properties
# Thay YOUR_GOOGLE_CLIENT_ID và YOUR_GOOGLE_CLIENT_SECRET
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
```

### Bước 3: Khởi động ứng dụng

Backend:
```bash
./mvnw clean spring-boot:run
```

Frontend:
```bash
cd z_Seatrans_Redesign
npm run dev
```

### Bước 4: Test đăng nhập

1. Truy cập http://localhost:3000/login
2. Click nút **Login with Google**
3. Chọn tài khoản Google
4. Cho phép quyền truy cập
5. Bạn sẽ được redirect về trang chủ với trạng thái đã đăng nhập

## Architecture Flow

```
User clicks "Login with Google"
    ↓
Frontend calls GET /api/auth/oauth2/google
    ↓
Backend returns Google authorization URL
    ↓
Frontend redirects to Google login page
    ↓
User logs in and authorizes
    ↓
Google redirects to /api/auth/oauth2/callback/google?code=...
    ↓
Backend exchanges code for access token
    ↓
Backend fetches user info from Google
    ↓
Backend creates/finds user in database
    ↓
Backend generates JWT token
    ↓
Backend redirects to /auth/callback?token=...&refreshToken=...
    ↓
Frontend stores tokens and user info
    ↓
Frontend redirects to home page
```

## Security Notes

- **KHÔNG** commit Client ID và Client Secret vào Git
- Sử dụng environment variables cho production
- Cập nhật redirect URIs cho production domain
- JWT tokens được lưu trong localStorage (có thể chuyển sang httpOnly cookies cho bảo mật cao hơn)

## Troubleshooting

### Lỗi "redirect_uri_mismatch"
- Kiểm tra redirect URI trong Google Console phải khớp chính xác
- URI phải bao gồm protocol (http/https) và không có trailing slash

### Lỗi "invalid_client"
- Kiểm tra Client ID và Client Secret đã đúng chưa
- Đảm bảo credentials được enable trong Google Console

### User không được tạo
- Kiểm tra database có role "ROLE_CUSTOMER" chưa
- Xem logs backend để debug

## Production Deployment

Khi deploy production, cập nhật:

1. **Google Console**: Thêm production domain vào authorized origins và redirect URIs
2. **Backend**: 
   ```properties
   spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/api/auth/oauth2/callback/google
   ```
3. **Frontend**: Cập nhật redirect URL trong OAuth2Controller.java

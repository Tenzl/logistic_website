# Hướng Dẫn Deploy Backend Spring Boot Lên Render

## Giới Thiệu Render

Render là nền tảng cloud hosting hiện đại, đơn giản hơn AWS/GCP, cung cấp:
- Miễn phí cho tier cơ bản (có giới hạn)
- Tự động deploy từ Git (GitHub/GitLab)
- SSL/HTTPS tự động
- Quản lý database PostgreSQL
- Logs và monitoring tích hợp

## Yêu Cầu Trước Khi Bắt Đầu

1. **Tài khoản Render**: Đăng ký tại [render.com](https://render.com)
2. **Git Repository**: Code backend đã push lên GitHub/GitLab
3. **Build Tool**: Maven (đã có trong project - `pom.xml`)
4. **Java Version**: Kiểm tra version trong `pom.xml`

## Bước 1: Chuẩn Bị Project

### 1.1. Kiểm Tra File `pom.xml`

Đảm bảo có Spring Boot Maven Plugin:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

### 1.2. Cấu Hình Port Động

Trong `application.properties`, thêm:

```properties
server.port=${PORT:8080}
```

Render sẽ tự động gán biến môi trường `PORT`.

### 1.3. Tạo File `render.yaml` (Tùy Chọn - Cách 1)

Tạo file `render.yaml` ở root project:

```yaml
services:
  - type: web
    name: seatrans-backend
    env: java
    buildCommand: ./mvnw clean package -DskipTests
    startCommand: java -jar target/*.jar
    envVars:
      - key: JAVA_VERSION
        value: 17
      - key: SPRING_PROFILES_ACTIVE
        value: production
```

## Bước 2: Tạo Web Service Trên Render

### Cách 1: Dùng Dashboard (Khuyến Nghị Cho Lần Đầu)

1. **Đăng nhập Render** → Click `New` → Chọn `Web Service`

2. **Connect Repository**:
   - Chọn GitHub/GitLab
   - Authorize Render truy cập repo
   - Chọn repository `seatrans`

3. **Cấu Hình Service**:
   ```
   Name: seatrans-backend
   Region: Singapore (gần Việt Nam nhất)
   Branch: main (hoặc branch bạn muốn)
   Root Directory: . (nếu backend ở root)
   Runtime: Java
   ```

4. **Build Settings**:
   ```
   Build Command: ./mvnw clean package -DskipTests
   Start Command: java -jar target/*.jar
   ```

5. **Instance Type**:
   - Free (512MB RAM, sleep sau 15 phút không dùng)
   - Starter ($7/tháng, không sleep)

6. Click `Create Web Service`

### Cách 2: Dùng Render Blueprint (render.yaml)

Nếu đã tạo `render.yaml`:
1. Dashboard → `New` → `Blueprint`
2. Chọn repo và branch
3. Render tự động đọc config từ file

## Bước 3: Cấu Hình Database

### 3.1. Tạo PostgreSQL Database

1. Dashboard → `New` → `PostgreSQL`
2. Đặt tên: `seatrans-db`
3. Chọn Free tier (1GB storage)
4. Region: Singapore
5. Click `Create Database`

### 3.2. Lấy Connection URL

Render sẽ tạo các thông tin:
- **Internal Database URL**: Dùng khi backend và DB cùng region
- **External Database URL**: Dùng từ bên ngoài

Copy `Internal Database URL` (dạng: `postgresql://user:pass@host:5432/dbname`)

### 3.3. Cấu Hình Backend Kết Nối DB

Trong Render Web Service:

1. Vào tab `Environment`
2. Thêm các biến:

```
SPRING_DATASOURCE_URL=<Internal_Database_URL>
SPRING_DATASOURCE_USERNAME=<tự động từ URL>
SPRING_DATASOURCE_PASSWORD=<tự động từ URL>
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
```

**Hoặc** đơn giản hơn, chỉ cần:

```
DATABASE_URL=<Internal_Database_URL>
SPRING_PROFILES_ACTIVE=production
```

Và cấu hình trong `application-production.properties`:

```properties
spring.datasource.url=${DATABASE_URL}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.show-sql=false
```

## Bước 4: Cấu Hình Biến Môi Trường

Trong tab `Environment`, thêm các biến cần thiết:

```
# Server
PORT=10000
SPRING_PROFILES_ACTIVE=production

# Database (nếu dùng Render Postgres)
DATABASE_URL=<từ bước 3>

# Google OAuth (nếu có)
GOOGLE_CLIENT_ID=<your_client_id>
GOOGLE_CLIENT_SECRET=<your_client_secret>

# JWT Secret
JWT_SECRET=<your_secure_random_string>

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.com

# File Upload
UPLOAD_PATH=/opt/render/project/src/uploads
MAX_FILE_SIZE=10485760
```

## Bước 5: Deploy

1. **Auto Deploy**: Mỗi khi push code lên Git, Render tự động build và deploy
2. **Manual Deploy**: Dashboard → `Manual Deploy` → Chọn branch

### Theo Dõi Deploy

- Tab `Logs`: Xem build logs và runtime logs
- Tab `Events`: Lịch sử deploy
- Trạng thái: Building → Deploying → Live

## Bước 6: Kiểm Tra

1. **URL của service**: `https://seatrans-backend.onrender.com`
2. **Health Check**:
   ```
   GET https://seatrans-backend.onrender.com/actuator/health
   ```
3. **API Endpoint**:
   ```
   GET https://seatrans-backend.onrender.com/api/...
   ```

## Các Vấn Đề Thường Gặp

### 1. Build Failed

**Lỗi**: `mvnw: Permission denied`

**Giải pháp**: Trong Git, chạy:
```bash
git update-index --chmod=+x mvnw
git commit -m "Make mvnw executable"
git push
```

**Lỗi**: `Java version mismatch`

**Giải pháp**: Thêm biến môi trường:
```
JAVA_VERSION=17
```

### 2. Database Connection Failed

- Kiểm tra `DATABASE_URL` đúng format
- Dùng `Internal Database URL` nếu DB và backend cùng region
- Kiểm tra firewall rules (Render tự động allow nội bộ)

### 3. Free Tier Sleep

**Vấn đề**: Service free sleep sau 15 phút không dùng, request đầu tiên mất 30-60s khởi động.

**Giải pháp**:
- Upgrade lên Starter plan ($7/tháng)
- Dùng cron job/uptime monitor ping mỗi 10 phút (UptimeRobot miễn phí)

### 4. File Upload

**Vấn đề**: File upload bị mất sau mỗi lần deploy (ephemeral storage).

**Giải pháp**:
- Dùng Cloudinary/AWS S3 để lưu file
- Hoặc mount persistent disk (plan trả phí)

### 5. CORS Error

Thêm config CORS trong Spring Boot:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${allowed.origins}")
    private String allowedOrigins;
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins.split(","))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## Tối Ưu Production

### 1. Environment Profiles

Tạo `application-production.properties`:

```properties
# Server
server.error.include-message=never
server.error.include-stacktrace=never

# Logging
logging.level.root=WARN
logging.level.com.example=INFO

# Database
spring.jpa.show-sql=false
spring.jpa.hibernate.ddl-auto=validate

# Security
spring.security.oauth2.client.registration.google.redirect-uri=https://seatrans-backend.onrender.com/login/oauth2/code/google
```

### 2. Health Check Endpoint

Render sẽ ping endpoint để check service health:

```properties
management.endpoints.web.exposure.include=health
management.endpoint.health.show-details=always
```

### 3. Dockerfile (Optional - Nếu Muốn Control Build)

Tạo `Dockerfile`:

```dockerfile
FROM maven:3.8.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Trong Render, chọn `Docker` runtime thay vì `Java`.

## Chi Phí

| Plan | RAM | Sleep | Giá/Tháng |
|------|-----|-------|-----------|
| Free | 512MB | Sau 15 phút | $0 |
| Starter | 512MB | Không | $7 |
| Standard | 2GB | Không | $25 |

**Database**:
- Free: 1GB, expires sau 90 ngày
- Starter: 10GB, $7/tháng

## Custom Domain

1. Dashboard → Service → `Settings` → `Custom Domain`
2. Thêm domain: `api.yourdomain.com`
3. Cấu hình DNS:
   ```
   Type: CNAME
   Name: api
   Value: seatrans-backend.onrender.com
   ```
4. SSL tự động active sau vài phút

## Monitoring & Logs

- **Logs**: Dashboard → `Logs` (realtime)
- **Metrics**: CPU, Memory, Request count
- **Alerts**: Cấu hình email alert khi service down

## So Sánh Với Cloudflare Tunnel

| Tính Năng | Render | Cloudflare Tunnel |
|-----------|--------|-------------------|
| Hosting | ✅ Render host app | ❌ Cần server riêng |
| Domain | ✅ Tự động SSL | ✅ Tự động SSL |
| Firewall | Render quản lý | ✅ WAF, DDoS |
| Chi phí | $7+/tháng | Miễn phí (cần server) |
| Use Case | Production hosting | Expose local/internal service |

## Kết Luận

Render phù hợp khi:
- ✅ Muốn hosting đơn giản, không setup server
- ✅ Auto deploy từ Git
- ✅ Cần database managed
- ✅ Budget nhỏ ($7-25/tháng)

Cloudflare Tunnel phù hợp khi:
- ✅ Đã có server riêng
- ✅ Cần bảo mật cao (WAF, Access Control)
- ✅ Service chạy local/internal network
- ✅ Không muốn mở port inbound

## Tài Liệu Tham Khảo

- [Render Docs](https://render.com/docs)
- [Deploy Spring Boot](https://render.com/docs/deploy-spring-boot)
- [Environment Variables](https://render.com/docs/environment-variables)

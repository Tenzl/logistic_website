# Spreadsheet File Management System - Setup Guide

## Tổng quan
Hệ thống quản lý file Excel theo từng service với khả năng upload, xóa và xem trực tiếp trong spreadsheet editor.

## Các thay đổi đã thực hiện

### Backend (Spring Boot)

#### 1. Entity & Database
- **File**: `UploadedFile.java` - Entity lưu metadata của file
- **Migration**: `migration_uploaded_files.sql` - Tạo bảng trong database
- **Fields**: id, fileName, originalFileName, serviceName, filePath, fileSize, uploadDate, uploadedBy

#### 2. Repository
- **File**: `UploadedFileRepository.java`
- **Methods**: 
  - findByServiceNameOrderByUploadDateDesc() - Lấy files theo service
  - findAllByOrderByServiceNameAscUploadDateDesc() - Lấy tất cả files

#### 3. Service Layer
- **File**: `SpreadsheetFileService.java`
- **Features**:
  - Upload file với validation (max 10MB, chỉ .xlsx/.xls)
  - Delete file (cả physical file và database record)
  - Load file để download
  - Group files theo service

#### 4. Controller
- **File**: `SpreadsheetFileController.java`
- **Endpoints**:
  - POST `/api/spreadsheet-files/upload` - Upload file
  - GET `/api/spreadsheet-files/service/{serviceName}` - Lấy files theo service
  - GET `/api/spreadsheet-files/all` - Lấy tất cả files grouped by service
  - DELETE `/api/spreadsheet-files/{fileId}` - Xóa file
  - GET `/api/spreadsheet-files/download/{fileId}` - Download file

### Frontend (Next.js + React)

#### 1. Types
- **File**: `spreadsheet-file.types.ts`
- Định nghĩa interfaces: UploadedFile, FileUploadResponse, ServiceFilesGroup
- Danh sách services: Freight Forwarding, Chartering & Broking, etc.

#### 2. Custom Hook
- **File**: `useFileManagement.ts`
- **Features**:
  - fetchFiles() - Load tất cả files
  - uploadFile() - Upload file mới
  - deleteFile() - Xóa file
  - downloadFile() - Tải file về
  - Auto-refresh sau mỗi thao tác

#### 3. Components

##### FileUploadDialog
- **File**: `FileUploadDialog.tsx`
- Modal dialog để upload file Excel
- Select service type
- Validation: file size, extension
- Progress bar khi upload

##### NavMain (Updated)
- **File**: `nav-main.tsx`
- **Changes**:
  - Thay ChevronRight icon → Plus icon
  - Plus icon để mở upload dialog
  - Thêm nút Delete (Trash icon) bên cạnh mỗi file
  - Alert dialog xác nhận trước khi xóa
  - Click vào file name để load file

##### AppSidebar (Updated)
- **File**: `app-sidebar.tsx`
- **Changes**:
  - Thay data tĩnh → data từ API
  - Title sections = Service names (Freight Forwarding, Ship Management, etc.)
  - Items = Danh sách file Excel đã upload
  - Tích hợp FileUploadDialog
  - Callbacks: onAddFile, onDeleteFile, onFileClick

##### UniverSheetAdvanced (Updated)
- **File**: `UniverSheetAdvanced.tsx`
- **Changes**:
  - Nhận props: selectedFileId, selectedFileName
  - Auto-load file từ backend khi selectedFileId thay đổi
  - Hiển thị tên file đang mở trong toolbar

##### SpreadsheetDashboard (Updated)
- **File**: `spreadsheet_dashboard.tsx`
- **Changes**:
  - Quản lý state: selectedFileId, selectedFileName
  - Pass callbacks từ AppSidebar → UniverSheet

## Cách chạy

### 1. Setup Database

```sql
-- Chạy migration SQL
mysql -u your_username -p your_database < database/migration_uploaded_files.sql
```

### 2. Backend Setup

```bash
# Đảm bảo đã cài đặt Maven và Java 17+

# Build project
mvn clean install

# Run Spring Boot
mvn spring-boot:run

# Hoặc
java -jar target/seatrans-0.0.1-SNAPSHOT.jar
```

**Lưu ý**: Đảm bảo file `application.properties` có cấu hình:
```properties
# Upload directory
app.upload.spreadsheet-dir=uploads/spreadsheets
app.upload.max-file-size=10485760

# Database config
spring.datasource.url=jdbc:mysql://localhost:3306/your_database
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Frontend Setup

```bash
cd z_Seatrans_Redesign

# Install dependencies (nếu chưa có)
npm install

# Run development server
npm run dev
```

### 4. Truy cập ứng dụng

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Spreadsheet Dashboard: http://localhost:3000/admin/spreadsheet (hoặc route bạn đã cấu hình)

## Cách sử dụng

### Upload File
1. Click vào icon **Plus (+)** bên cạnh tên service trong sidebar
2. Chọn service type (mặc định là service đã click)
3. Chọn file Excel (.xlsx hoặc .xls)
4. Click "Upload"
5. File sẽ xuất hiện trong danh sách của service đó

### Xem File
1. Click vào tên file trong sidebar
2. File sẽ được load vào spreadsheet editor
3. Có thể xem và edit nội dung

### Xóa File
1. Hover vào file name trong sidebar
2. Click icon **Trash (🗑️)** xuất hiện bên phải
3. Xác nhận xóa trong dialog
4. File sẽ bị xóa khỏi cả database và ổ đĩa

### Export File
1. Sau khi edit, click "Export Excel" hoặc "Export CSV" ở toolbar
2. File sẽ được tải về máy

## Cấu trúc thư mục upload

```
uploads/
  spreadsheets/
    Freight Forwarding/
      20251226_120000_abc12345.xlsx
      20251226_130000_def67890.xlsx
    Chartering & Broking/
      20251226_140000_ghi11111.xlsx
    ...
```

## Testing

### Test Backend API với curl:

```bash
# Upload file
curl -X POST http://localhost:8080/api/spreadsheet-files/upload \
  -F "file=@pricing.xlsx" \
  -F "serviceName=Freight Forwarding" \
  -F "uploadedBy=admin"

# Get all files
curl http://localhost:8080/api/spreadsheet-files/all

# Get files by service
curl http://localhost:8080/api/spreadsheet-files/service/Freight%20Forwarding

# Delete file
curl -X DELETE http://localhost:8080/api/spreadsheet-files/1

# Download file
curl -O http://localhost:8080/api/spreadsheet-files/download/1
```

## Troubleshooting

### Lỗi CORS
Nếu gặp lỗi CORS, kiểm tra annotation trong Controller:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

### Lỗi File Upload
- Kiểm tra thư mục `uploads/spreadsheets` có tồn tại không
- Kiểm tra quyền ghi của thư mục
- Kiểm tra kích thước file (max 10MB)

### Lỗi Database
- Chạy lại migration SQL
- Kiểm tra connection string trong application.properties

### File không load trong UniverSheet
- Kiểm tra backend API có chạy không
- Kiểm tra network tab trong DevTools xem có lỗi 404/500 không
- Kiểm tra file path trong database có đúng không

## Các service có sẵn

1. Freight Forwarding (🚚)
2. Chartering & Broking (⛴️)
3. Ship Management (⚓)
4. Port Operations (📦)
5. Customs Clearance (📄)
6. Warehousing (🏭)

## Future Enhancements

- [ ] Version control cho files
- [ ] Sharing files giữa các users
- [ ] Comments/annotations trên spreadsheet
- [ ] Real-time collaboration
- [ ] File templates cho mỗi service
- [ ] Import/export history
- [ ] Advanced search & filter

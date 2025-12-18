# Image Management System - Backend Architecture

## Overview
Hệ thống quản lý ảnh cho 4 dịch vụ chính của Seatrans. Mỗi service có thể có:
- **Built-in Types**: 4 loại mặc định (Gallery, Certificates, Equipment, Operations)
- **Custom Types**: Admin có thể tạo thêm loại mới tùy ý
- **Limit**: Max 18 ảnh trên mỗi loại

## Database Schema

### 1. ServiceType Enum
```
SHIPPING_AGENCY
CHARTERING_BROKING
FREIGHT_FORWARDING
TOTAL_LOGISTICS
```

### 2. ImageType Enum
```
GALLERY
CERTIFICATES
EQUIPMENT
OPERATIONS
```

### 3. Gallery Image Entity

```java
@Entity
@Table(name = "gallery_images")
public class GalleryImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceType serviceType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ImageType imageType;
    
    @Column(nullable = false)
    private String imageUrl;
    
    @Column(nullable = true)
    private String caption;
    
    @Column(nullable = true)
    private String description;
    
    @Column(nullable = false)
    private Integer displayOrder;
    
    @Column(nullable = false)
    private LocalDateTime uploadedAt;
    
    @Column(nullable = true)
    private Long uploadedBy; // Reference to User
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ImageStatus status; // ACTIVE, INACTIVE
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
```

### 4. ImageStatus Enum
```
ACTIVE
INACTIVE
```

## API Endpoints

### Admin Only (ROLE_INTERNAL)

#### 1. Upload Image
```
POST /api/admin/gallery-images
Content-Type: multipart/form-data

Parameters:
- file (required): Binary image file
- serviceType (required): SHIPPING_AGENCY | CHARTERING_BROKING | FREIGHT_FORWARDING | TOTAL_LOGISTICS
- imageType (required): GALLERY | CERTIFICATES | EQUIPMENT | OPERATIONS
- caption (optional): String
- description (optional): String
- displayOrder (optional): Integer (default: latest + 1)

Response:
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "id": 1,
    "serviceType": "SHIPPING_AGENCY",
    "imageType": "GALLERY",
    "imageUrl": "http://cdn.url/image.jpg",
    "caption": "Port facility",
    "description": "Main port facility",
    "displayOrder": 1,
    "uploadedAt": "2025-12-07T16:35:00Z",
    "uploadedBy": 1,
    "status": "ACTIVE"
  }
}
```

#### 2. Get All Images (with filters)
```
GET /api/admin/gallery-images?serviceType=SHIPPING_AGENCY&imageType=GALLERY&status=ACTIVE

Query Parameters (all optional):
- serviceType: Filter by service
- imageType: Filter by type
- status: ACTIVE or INACTIVE
- page: Page number (default: 0)
- size: Page size (default: 20)

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "serviceType": "SHIPPING_AGENCY",
      "imageType": "GALLERY",
      "imageUrl": "...",
      "caption": "...",
      "displayOrder": 1,
      "status": "ACTIVE"
    }
  ],
  "totalElements": 72,
  "totalPages": 4
}
```

#### 3. Get Image by ID
```
GET /api/admin/gallery-images/{id}

Response:
{
  "success": true,
  "data": { ...full image data... }
}
```

#### 4. Update Image
```
PUT /api/admin/gallery-images/{id}
Content-Type: application/json

Body:
{
  "caption": "Updated caption",
  "description": "Updated description",
  "displayOrder": 2,
  "status": "INACTIVE"
}

Response:
{
  "success": true,
  "message": "Image updated successfully",
  "data": { ...updated image data... }
}
```

#### 5. Delete Image
```
DELETE /api/admin/gallery-images/{id}

Response:
{
  "success": true,
  "message": "Image deleted successfully"
}
```

#### 6. Reorder Images
```
PUT /api/admin/gallery-images/reorder
Content-Type: application/json

Body:
{
  "imageIds": [1, 2, 3, 4]  // New order
}

Response:
{
  "success": true,
  "message": "Images reordered successfully"
}
```

#### 7. Get Image Count by Service & Type
```
GET /api/admin/gallery-images/count-by-service?serviceType=SHIPPING_AGENCY&imageType=GALLERY

Response:
{
  "success": true,
  "data": {
    "serviceType": "SHIPPING_AGENCY",
    "imageType": "GALLERY",
    "current": 18,
    "maxAllowed": 18,
    "isFull": true
  }
}
```

### Custom Image Types Management (Admin Only)

#### 1. Create Custom Image Type
```
POST /api/admin/image-types
Content-Type: application/json

Body:
{
  "serviceType": "SHIPPING_AGENCY",
  "code": "SPECIAL_EVENTS",
  "name": "Special Events",
  "description": "Photos from special events",
  "displayOrder": 5
}

Response:
{
  "success": true,
  "message": "Image type created successfully",
  "data": {
    "id": 1,
    "serviceType": "SHIPPING_AGENCY",
    "code": "SPECIAL_EVENTS",
    "name": "Special Events",
    "description": "Photos from special events",
    "displayOrder": 5,
    "isActive": true,
    "createdAt": "2025-12-07T16:35:00Z",
    "updatedAt": "2025-12-07T16:35:00Z"
  }
}
```

#### 2. Get All Image Types for Service (Active Only)
```
GET /api/admin/image-types/by-service/SHIPPING_AGENCY

Response:
{
  "success": true,
  "message": "Image types retrieved successfully",
  "data": [
    {
      "id": 1,
      "serviceType": "SHIPPING_AGENCY",
      "code": "GALLERY",
      "name": "Gallery",
      "displayOrder": 1,
      "isActive": true
    },
    {
      "id": 2,
      "serviceType": "SHIPPING_AGENCY",
      "code": "CERTIFICATES",
      "name": "Certificates",
      "displayOrder": 2,
      "isActive": true
    },
    {
      "id": 10,
      "serviceType": "SHIPPING_AGENCY",
      "code": "SPECIAL_EVENTS",
      "name": "Special Events",
      "displayOrder": 5,
      "isActive": true
    }
  ]
}
```

#### 3. Get All Image Types for Service (Including Inactive)
```
GET /api/admin/image-types/by-service/SHIPPING_AGENCY/all

Response:
{
  "success": true,
  "data": [...]
}
```

#### 4. Get Image Type by ID
```
GET /api/admin/image-types/{id}

Response:
{
  "success": true,
  "data": { ...image type data... }
}
```

#### 5. Update Image Type
```
PUT /api/admin/image-types/{id}
Content-Type: application/json

Body:
{
  "name": "Updated Name",
  "description": "Updated description",
  "displayOrder": 6,
  "isActive": true
}

Response:
{
  "success": true,
  "message": "Image type updated successfully",
  "data": { ...updated data... }
}
```

#### 6. Delete Image Type
```
DELETE /api/admin/image-types/{id}

Response:
{
  "success": true,
  "message": "Image type deleted successfully"
}
```

### Public API (Accessible by All)

#### 1. Get Gallery Images for Frontend
```
GET /api/gallery/images?serviceType=SHIPPING_AGENCY&imageType=GALLERY

Query Parameters:
- serviceType (required)
- imageType (required)
- status: Default ACTIVE only

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "imageUrl": "...",
      "caption": "...",
      "displayOrder": 1
    }
  ]
}
```

## Business Rules

### Image Upload
1. **Validation**: 
   - File size: max 5MB
   - Format: JPG, PNG, WebP only
   - Dimensions: min 640x480, max 4000x3000
   - Aspect ratio: flexible

2. **Storage**:
   - Local storage: `/uploads/gallery/{serviceType}/{imageType}/{timestamp}_{filename}`
   - Or external: AWS S3, Firebase Storage (configure in properties)

3. **Limits**:
   - Max 18 images per (serviceType + imageType) combination
   - Total combinations: 4 services × 4 types = 16 combinations
   - Max total: 16 × 18 = 288 images

### Image Update
- Only caption, description, displayOrder, status can be changed
- uploadedBy and uploadedAt are immutable
- updatedAt is auto-updated

### Image Deletion
- Hard delete from database
- Delete file from storage
- Cannot be undone

### Access Control
- **Admin (ROLE_INTERNAL)**: Can perform all CRUD operations
- **Public**: Can only view active images
- **Other Roles**: Cannot upload/edit/delete

## Data Transfer Objects (DTOs)

### GalleryImageDTO
```java
public class GalleryImageDTO {
    private Long id;
    private String serviceType;
    private String imageType;
    private String imageUrl;
    private String caption;
    private String description;
    private Integer displayOrder;
    private LocalDateTime uploadedAt;
    private String uploadedByUsername;
    private String status;
}
```

### CreateImageRequest
```java
public class CreateImageRequest {
    @NotNull
    private String serviceType;
    
    @NotNull
    private String imageType;
    
    @NotEmpty
    private String caption;
    
    private String description;
    
    private Integer displayOrder;
}
```

### UpdateImageRequest
```java
public class UpdateImageRequest {
    private String caption;
    private String description;
    private Integer displayOrder;
    private String status;
}
```

## Error Responses

### 1. Maximum Images Reached
```json
{
  "success": false,
  "message": "Maximum 18 images allowed for this service and type combination",
  "errorCode": "MAX_IMAGES_EXCEEDED"
}
```

### 2. Invalid File Format
```json
{
  "success": false,
  "message": "Invalid file format. Allowed: JPG, PNG, WebP",
  "errorCode": "INVALID_FILE_FORMAT"
}
```

### 3. Unauthorized
```json
{
  "success": false,
  "message": "Only ROLE_INTERNAL can perform this action",
  "errorCode": "UNAUTHORIZED"
}
```

### 4. Image Not Found
```json
{
  "success": false,
  "message": "Image not found",
  "errorCode": "NOT_FOUND"
}
```

## Folder Structure

```
src/
├── main/
│   ├── java/com/example/seatrans/
│   │   ├── entity/
│   │   │   ├── GalleryImage.java (NEW)
│   │   │   ├── ServiceType.java (NEW)
│   │   │   ├── ImageType.java (NEW)
│   │   │   └── ImageStatus.java (NEW)
│   │   ├── dto/
│   │   │   ├── GalleryImageDTO.java (NEW)
│   │   │   ├── CreateImageRequest.java (NEW)
│   │   │   └── UpdateImageRequest.java (NEW)
│   │   ├── repository/
│   │   │   └── GalleryImageRepository.java (NEW)
│   │   ├── service/
│   │   │   └── GalleryImageService.java (NEW)
│   │   ├── controller/
│   │   │   └── GalleryImageController.java (NEW)
│   │   └── util/
│   │       └── FileUploadUtil.java (NEW)
│   └── resources/
│       └── uploads/ (NEW - for local storage)
```

## Dependencies

```xml
<!-- Tùy chọn: Thêm vào pom.xml nếu dùng AWS S3 -->
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.20.0</version>
</dependency>

<!-- Image processing (optional) -->
<dependency>
    <groupId>org.imgscalr</groupId>
    <artifactId>imgscalr-lib</artifactId>
    <version>4.2</version>
</dependency>
```

## Configuration (application.properties)

```properties
# File Upload
app.upload.dir=uploads/gallery
app.upload.max-file-size=5242880  # 5MB in bytes
app.upload.allowed-extensions=jpg,jpeg,png,webp

# Storage Type: LOCAL or S3
app.storage.type=LOCAL

# S3 Configuration (if needed)
aws.s3.bucket-name=seatrans-gallery
aws.s3.region=ap-southeast-1
aws.s3.access-key=${AWS_ACCESS_KEY}
aws.s3.secret-key=${AWS_SECRET_KEY}
```

## Implementation Priority

1. **Phase 1**: Entity, Repository, DTO
2. **Phase 2**: Service layer with validation
3. **Phase 3**: Admin Controller with upload
4. **Phase 4**: Public API for frontend
5. **Phase 5**: File storage implementation
6. **Phase 6**: Frontend UI

---

**Status**: Ready for implementation
**Last Updated**: 2025-12-07

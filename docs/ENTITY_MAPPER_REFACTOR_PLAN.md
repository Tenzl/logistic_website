# Entity Mapper Refactoring Plan

## 📋 Tổng quan
Hiện tại codebase có **sự không nhất quán** về cách mapping Entity → DTO:
- **Auth & Gallery features**: Sử dụng `EntityMapper` (shared/mapper)
- **Các features khác**: Mỗi Service có method mapper riêng

**Mục tiêu**: Chuẩn hóa toàn bộ codebase sử dụng `EntityMapper` tập trung.

---

## ✅ Đã sử dụng EntityMapper (Không cần sửa)

### 1. Auth Feature
- ✅ `AuthServiceImpl.java` - dùng `entityMapper.toUserDTO()`
- ✅ `UserController.java` - dùng `entityMapper.toUserDTO()`
- ✅ `OAuth2Controller.java` - dùng `entityMapper.toUserDTO()`
- ✅ `AdminUserController.java` - dùng `entityMapper.toUserDTO()`

### 2. Gallery Feature
- ✅ `GalleryImagePublicService.java` - dùng `entityMapper.toGalleryImageDTO()`
- ✅ `GalleryImageAdminService.java` - dùng `entityMapper.toGalleryImageDTO()`

---

## 🔧 Cần Refactor (7 Services)

### 1. **ServiceTypeService** 
**File**: `backend/src/main/java/com/example/seatrans/features/logistics/service/ServiceTypeService.java`

**Vấn đề**: 
- Có method `convertToDTO(ServiceTypeEntity)` riêng
- EntityMapper đã có `toServiceTypeDTO()` tương tự

**Cách sửa**:
```java
// BEFORE
private ServiceTypeDTO convertToDTO(ServiceTypeEntity serviceType) {
    return new ServiceTypeDTO(...);
}

// Các nơi gọi:
.map(this::convertToDTO)
return convertToDTO(serviceType);

// ===================================

// AFTER
// 1. Inject EntityMapper
private final EntityMapper entityMapper;

// 2. Xóa method convertToDTO()

// 3. Thay thế tất cả calls:
.map(entityMapper::toServiceTypeDTO)
return entityMapper.toServiceTypeDTO(serviceType);
```

**Số lượng thay đổi**: ~7-10 chỗ

---

### 2. **ImageTypeAdminService**
**File**: `backend/src/main/java/com/example/seatrans/features/gallery/service/ImageTypeAdminService.java`

**Vấn đề**:
- Có method `convertToDTO(ImageTypeEntity)` riêng
- EntityMapper đã có `toImageTypeDTO()`

**Cách sửa**:
```java
// BEFORE
private ImageTypeDTO convertToDTO(ImageTypeEntity imageType) {
    return new ImageTypeDTO(...);
}

// ===================================

// AFTER
// 1. Inject EntityMapper
private final EntityMapper entityMapper;

// 2. Xóa method convertToDTO()

// 3. Thay thế:
.map(this::convertToDTO) → .map(entityMapper::toImageTypeDTO)
return convertToDTO(imageType) → return entityMapper.toImageTypeDTO(imageType)
```

**Số lượng thay đổi**: ~5 chỗ

---

### 3. **ImageTypePublicService**
**File**: `backend/src/main/java/com/example/seatrans/features/gallery/service/ImageTypePublicService.java`

**Vấn đề**: 
- Có method `convertToDTO(ImageTypeEntity)` riêng
- Duplicate với ImageTypeAdminService

**Cách sửa**: Tương tự ImageTypeAdminService

**Số lượng thay đổi**: ~3-4 chỗ

---

### 4. **PortService**
**File**: `backend/src/main/java/com/example/seatrans/features/ports/service/PortService.java`

**Vấn đề**:
- Có method `convertToDTO(Port)` riêng
- EntityMapper đã có `toPortDTO()`

**Cách sửa**:
```java
// BEFORE
private PortDTO convertToDTO(Port port) {
    String provinceName = port.getProvince() != null ? port.getProvince().getName() : "";
    return new PortDTO(...);
}

// ===================================

// AFTER
// 1. Inject EntityMapper
private final EntityMapper entityMapper;

// 2. Xóa method convertToDTO()

// 3. Thay thế:
.map(this::convertToDTO) → .map(entityMapper::toPortDTO)
```

**Số lượng thay đổi**: ~5-7 chỗ

---

### 5. **ProvinceService**
**File**: `backend/src/main/java/com/example/seatrans/features/provinces/service/ProvinceService.java`

**Vấn đề**:
- Có method `convertToDTO(Province)` riêng
- EntityMapper đã có `toProvinceDTO()`

**Cách sửa**: Tương tự PortService

**Số lượng thay đổi**: ~5-7 chỗ

---

### 6. **OfficeService**
**File**: `backend/src/main/java/com/example/seatrans/features/logistics/service/OfficeService.java`

**Vấn đề**:
- Có method `convertToDTO(Office)` riêng
- EntityMapper **CHƯA CÓ** `toOfficeDTO()`

**Cách sửa**:
```java
// Step 1: Thêm vào EntityMapper.java
public OfficeDTO toOfficeDTO(Office office) {
    if (office == null) return null;
    
    String provinceName = office.getProvince() != null ? office.getProvince().getName() : "";
    
    return OfficeDTO.builder()
            .id(office.getId())
            .name(office.getName())
            .city(provinceName)
            .region("") // No region mapping required
            .address(office.getAddress())
            .latitude(office.getLatitude())
            .longitude(office.getLongitude())
            .phone(office.getPhone())
            .email(office.getEmail())
            .description(office.getDescription())
            .isActive(office.getIsActive())
            .build();
}

// Step 2: Refactor OfficeService.java
private final EntityMapper entityMapper;

// Xóa convertToDTO(), thay bằng:
.map(entityMapper::toOfficeDTO)
```

**Số lượng thay đổi**: 
- EntityMapper: +1 method
- OfficeService: ~5-7 chỗ

---

### 7. **PostService**
**File**: `backend/src/main/java/com/example/seatrans/features/post/service/PostService.java`

**Vấn đề**:
- Có method `toResponse(Post)` riêng
- EntityMapper **CHƯA CÓ** `toPostResponse()`
- PostResponse khá phức tạp (có nested DTOs: categories, images, author)

**Cách sửa**:
```java
// Step 1: Thêm vào EntityMapper.java
public PostResponse toPostResponse(Post post) {
    if (post == null) return null;
    
    return PostResponse.builder()
            .id(post.getId())
            .title(post.getTitle())
            .slug(post.getSlug())
            .excerpt(post.getExcerpt())
            .content(post.getContent())
            .featuredImage(post.getFeaturedImage())
            .images(post.getPostImages() != null ? 
                    post.getPostImages().stream()
                        .map(PostImage::getImageUrl)
                        .collect(Collectors.toList()) : 
                    List.of())
            .categories(post.getPostCategories() != null ?
                    post.getPostCategories().stream()
                        .map(pc -> toCategoryResponse(pc.getCategory()))
                        .collect(Collectors.toList()) :
                    List.of())
            .authorId(post.getAuthor() != null ? post.getAuthor().getId() : null)
            .authorName(post.getAuthor() != null ? post.getAuthor().getFullName() : null)
            .isPublished(post.getIsPublished())
            .publishedAt(post.getPublishedAt())
            .viewCount(post.getViewCount())
            .createdAt(post.getCreatedAt())
            .updatedAt(post.getUpdatedAt())
            .build();
}

public CategoryResponse toCategoryResponse(Category category) {
    if (category == null) return null;
    
    return CategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .slug(category.getSlug())
            .description(category.getDescription())
            .build();
}

// Step 2: Refactor PostService.java
private final EntityMapper entityMapper;

// Xóa toResponse() và toCategoryResponse(), thay bằng:
.map(entityMapper::toPostResponse)
return entityMapper.toPostResponse(post);
```

**Số lượng thay đổi**: 
- EntityMapper: +2 methods (toPostResponse, toCategoryResponse)
- PostService: ~13 chỗ

---

### 8. **InquiryDocumentService**
**File**: `backend/src/main/java/com/example/seatrans/features/inquiry/service/InquiryDocumentService.java`

**Vấn đề**:
- Có method `mapToDTO(InquiryDocument)` riêng
- EntityMapper **CHƯA CÓ** `toInquiryDocumentDTO()`
- DTO khá phức tạp (có thông tin uploadedBy)

**Cách sửa**:
```java
// Step 1: Thêm vào EntityMapper.java
public InquiryDocumentDTO toInquiryDocumentDTO(InquiryDocument document) {
    if (document == null) return null;
    
    return InquiryDocumentDTO.builder()
            .id(document.getId())
            .serviceSlug(document.getServiceSlug())
            .targetId(document.getTargetId())
            .documentType(document.getDocumentType())
            .fileName(document.getFileName())
            .originalFileName(document.getOriginalFileName())
            .fileSize(document.getFileSize())
            .mimeType(document.getMimeType())
            .description(document.getDescription())
            .uploadedAt(document.getUploadedAt())
            .uploadedByName(document.getUploadedBy() != null ? 
                    document.getUploadedBy().getFullName() : null)
            .uploadedByEmail(document.getUploadedBy() != null ? 
                    document.getUploadedBy().getEmail() : null)
            .version(document.getVersion())
            .checksum(document.getChecksum())
            .isActive(document.getIsActive())
            .cloudinaryUrl(document.getCloudinaryUrl())
            .cloudinaryPublicId(document.getCloudinaryPublicId())
            .build();
}

// Step 2: Refactor InquiryDocumentService.java
private final EntityMapper entityMapper;

// Xóa mapToDTO(), thay bằng:
.map(entityMapper::toInquiryDocumentDTO)
return entityMapper.toInquiryDocumentDTO(document);
```

**Số lượng thay đổi**: 
- EntityMapper: +1 method
- InquiryDocumentService: ~3-5 chỗ

---

## 📊 Tổng kết thay đổi

| Service | EntityMapper cần thêm? | Số chỗ cần sửa | Mức độ phức tạp |
|---------|------------------------|-----------------|-----------------|
| ServiceTypeService | ❌ Đã có | ~7-10 | ⭐ Dễ |
| ImageTypeAdminService | ❌ Đã có | ~5 | ⭐ Dễ |
| ImageTypePublicService | ❌ Đã có | ~3-4 | ⭐ Dễ |
| PortService | ❌ Đã có | ~5-7 | ⭐ Dễ |
| ProvinceService | ❌ Đã có | ~5-7 | ⭐ Dễ |
| OfficeService | ✅ Cần thêm | ~5-7 | ⭐⭐ Trung bình |
| PostService | ✅ Cần thêm | ~13 | ⭐⭐⭐ Phức tạp |
| InquiryDocumentService | ✅ Cần thêm | ~3-5 | ⭐⭐ Trung bình |

**Tổng cộng**: ~46-58 chỗ cần sửa

---

## 🎯 Thứ tự thực hiện đề xuất

### Phase 1: Services có method đã tồn tại trong EntityMapper (Dễ)
1. ✅ ServiceTypeService
2. ✅ PortService
3. ✅ ProvinceService
4. ✅ ImageTypeAdminService
5. ✅ ImageTypePublicService

### Phase 2: Services cần thêm method mới vào EntityMapper (Trung bình)
6. ✅ OfficeService
7. ✅ InquiryDocumentService

### Phase 3: Services phức tạp (Khó)
8. ✅ PostService - COMPLETE

---

## 🎉 REFACTORING COMPLETE!

**Summary**:
- ✅ **Phase 1**: 5 services refactored (ServiceType, ImageType x2, Port, Province)
- ✅ **Phase 2**: 2 services refactored (Office, InquiryDocument)  
- ✅ **Phase 3**: 1 service refactored (Post)
- ✅ **Total**: 8 services now using centralized EntityMapper
- ✅ **EntityMapper methods**: 10 mapping methods (User, GalleryImage, ServiceType, ImageType, Port, Province, Office, InquiryDocument, Post, Category)

**Final Changes**:
- PostService: 10 method call replacements
- EntityMapper: Added toPostResponse() and toCategoryResponse()
- Removed all duplicate mapper methods
- All services compile successfully

---

## ✨ Lợi ích sau khi refactor

1. **Nhất quán**: Tất cả services đều dùng EntityMapper
2. **DRY Principle**: Không duplicate mapping logic
3. **Dễ maintain**: Thay đổi mapping chỉ cần sửa 1 chỗ
4. **Testability**: Dễ test mapper riêng biệt
5. **Centralized**: Tất cả mapping logic ở 1 nơi

---

**Status**: ✅ ALL PHASES COMPLETE - EntityMapper consolidation finished! 🚀

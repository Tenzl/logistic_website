package com.example.seatrans.shared.mapper;

import org.springframework.stereotype.Component;

import com.example.seatrans.features.auth.dto.UserDTO;
import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.gallery.dto.GalleryImageDTO;
import com.example.seatrans.features.gallery.dto.ImageTypeDTO;
import com.example.seatrans.features.gallery.model.GalleryImage;
import com.example.seatrans.features.gallery.model.ImageTypeEntity;
import com.example.seatrans.features.inquiry.dto.InquiryDocumentDTO;
import com.example.seatrans.features.inquiry.model.InquiryDocument;
import com.example.seatrans.features.logistics.dto.OfficeDTO;
import com.example.seatrans.features.logistics.dto.ServiceTypeDTO;
import com.example.seatrans.features.logistics.model.Office;
import com.example.seatrans.features.logistics.model.ServiceTypeEntity;
import com.example.seatrans.features.ports.dto.PortDTO;
import com.example.seatrans.features.ports.model.Port;
import com.example.seatrans.features.post.dto.CategoryResponse;
import com.example.seatrans.features.post.dto.PostResponse;
import com.example.seatrans.features.post.model.Category;
import com.example.seatrans.features.post.model.Post;
import com.example.seatrans.features.provinces.dto.ProvinceDTO;
import com.example.seatrans.features.provinces.model.Province;

/**
 * Entity to DTO Mapper
 */
@Component
public class EntityMapper {
    
    // ==================== User Mapping ====================
    
    /**
     * Convert User entity sang UserDTO
     */
    public UserDTO toUserDTO(User user) {
        if (user == null) {
            return null;
        }
        
        return UserDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .phone(user.getPhone())
            .company(user.getCompany())
            .isActive(user.getIsActive())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .lastLogin(user.getLastLogin())
            .roleId(user.getRole() != null ? user.getRole().getId() : null)
            .role(user.getRole() != null ? user.getRole().getName() : null)
            .roleGroup(user.getRoleGroup() != null ? user.getRoleGroup().name() : null)
            .build();
    }
    
    // ==================== Gallery Image Mapping ====================
    
    /**
     * Convert GalleryImage entity to GalleryImageDTO
     */
    public GalleryImageDTO toGalleryImageDTO(GalleryImage image) {
        if (image == null) {
            return null;
        }
        
        return GalleryImageDTO.builder()
                .id(image.getId())
                .serviceType(toServiceTypeDTO(image.getServiceType()))
                .imageType(toImageTypeDTO(image.getImageType()))
                .province(toProvinceDTO(image.getProvince()))
                .port(toPortDTO(image.getPort()))
                .imageUrl(image.getImageUrl())
                .uploadedAt(image.getUploadedAt())
                .uploadedById(image.getUploadedById())
                .build();
    }

    // ==================== Helper Mappings ====================

    public ServiceTypeDTO toServiceTypeDTO(ServiceTypeEntity entity) {
        if (entity == null) return null;
        return new ServiceTypeDTO(
                entity.getId(),
                entity.getName(),
                entity.getDisplayName(),
                entity.getDescription(),
                entity.getIsActive()
        );
    }

    public ImageTypeDTO toImageTypeDTO(ImageTypeEntity entity) {
        if (entity == null) return null;
        return new ImageTypeDTO(
                entity.getId(),
                entity.getServiceType() != null ? entity.getServiceType().getId() : null,
                entity.getServiceType() != null ? entity.getServiceType().getName() : "",
                entity.getName(),
                entity.getDisplayName(),
                entity.getDescription(),
                entity.getRequiredImageCount(),
                entity.getIsActive()
        );
    }

    public ProvinceDTO toProvinceDTO(Province entity) {
        if (entity == null) return null;
        
        int portCount = 0;
        java.util.List<String> portNames = new java.util.ArrayList<>();
        
        if (entity.getPorts() != null) {
            portCount = entity.getPorts().size();
            portNames = entity.getPorts().stream()
                    .map(Port::getName)
                    .collect(java.util.stream.Collectors.toList());
        }
        
        return new ProvinceDTO(
                entity.getId(),
                entity.getName(),
                portCount,
                portNames,
                entity.getIsActive()
        );
    }

    public PortDTO toPortDTO(Port entity) {
        if (entity == null) return null;
        return new PortDTO(
                entity.getId(),
                entity.getName(),
                entity.getProvince() != null ? entity.getProvince().getId() : null,
                entity.getProvince() != null ? entity.getProvince().getName() : "",
                entity.getIsActive()
        );
    }

    // ==================== Office Mapping ====================

    public OfficeDTO toOfficeDTO(Office entity) {
        if (entity == null) return null;
        
        String provinceName = entity.getProvince() != null ? entity.getProvince().getName() : "";
        String region = ""; // No region mapping required
        
        return OfficeDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .city(provinceName)
                .region(region)
                .address(entity.getAddress())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .manager(OfficeDTO.ManagerDTO.builder()
                        .name(entity.getManagerName())
                        .title(entity.getManagerTitle())
                        .mobile(entity.getManagerMobile())
                        .email(entity.getManagerEmail())
                        .build())
                .coordinates(OfficeDTO.CoordinatesDTO.builder()
                        .lat(entity.getLatitude())
                        .lng(entity.getLongitude())
                        .build())
                .isHeadquarter(entity.getIsHeadquarter())
                .isActive(entity.getIsActive())
                .build();
    }

    // ==================== Inquiry Document Mapping ====================

    public InquiryDocumentDTO toInquiryDocumentDTO(InquiryDocument entity) {
        if (entity == null) return null;
        
        return InquiryDocumentDTO.builder()
                .id(entity.getId())
                .serviceSlug(entity.getServiceSlug())
                .targetId(entity.getTargetId())
                .documentType(entity.getDocumentType())
                .fileName(entity.getFileName())
                .originalFileName(entity.getOriginalFileName())
                .fileSize(entity.getFileSize())
                .mimeType(entity.getMimeType())
                .description(entity.getDescription())
                .uploadedAt(entity.getUploadedAt())
                .uploadedByName(entity.getUploadedBy() != null ? entity.getUploadedBy().getFullName() : null)
                .uploadedByEmail(entity.getUploadedBy() != null ? entity.getUploadedBy().getEmail() : null)
                .version(entity.getVersion())
                .checksum(entity.getChecksum())
                .isActive(entity.getIsActive())
                .cloudinaryUrl(entity.getCloudinaryUrl())
                .cloudinaryPublicId(entity.getCloudinaryPublicId())
                .build();
    }

    // ==================== Post Mapping ====================

    public PostResponse toPostResponse(Post entity) {
        if (entity == null) return null;
        
        java.util.List<CategoryResponse> categories = entity.getPostCategories() != null ?
                entity.getPostCategories().stream()
                    .map(pc -> toCategoryResponse(pc.getCategory()))
                    .collect(java.util.stream.Collectors.toList()) :
                java.util.List.of();
        
        return PostResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .authorId(entity.getAuthor() != null ? entity.getAuthor().getId() : null)
                .authorName(entity.getAuthor() != null ? 
                        (entity.getAuthor().getFullName() != null ? 
                            entity.getAuthor().getFullName() : 
                            entity.getAuthor().getEmail()) : null)
                .categories(categories)
                .thumbnailUrl(entity.getThumbnailUrl())
                .thumbnailPublicId(entity.getThumbnailPublicId())
                .publishedAt(entity.getPublishedAt())
                .isPublished(entity.getIsPublished())
                .viewCount(entity.getViewCount())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public CategoryResponse toCategoryResponse(Category entity) {
        if (entity == null) return null;
        
        return CategoryResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .build();
    }
    
}



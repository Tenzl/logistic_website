package com.example.seatrans.shared.mapper;

import org.springframework.stereotype.Component;

import com.example.seatrans.features.auth.dto.UserDTO;
import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.gallery.dto.GalleryImageDTO;
import com.example.seatrans.features.gallery.dto.ImageTypeDTO;
import com.example.seatrans.features.gallery.model.GalleryImage;
import com.example.seatrans.features.gallery.model.ImageTypeEntity;
import com.example.seatrans.features.logistics.dto.ServiceTypeDTO;
import com.example.seatrans.features.logistics.model.ServiceTypeEntity;
import com.example.seatrans.features.ports.dto.PortDTO;
import com.example.seatrans.features.ports.model.Port;
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
        return new ServiceTypeDTO(entity.getId(), entity.getName(), entity.getDisplayName(), entity.getDescription(), true);
    }

    public ImageTypeDTO toImageTypeDTO(ImageTypeEntity entity) {
        if (entity == null) return null;
        return new ImageTypeDTO(entity.getId(), entity.getServiceType().getId(), entity.getServiceType().getName(), entity.getName(), entity.getDisplayName(), entity.getDescription(), entity.getRequiredImageCount(), true);
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
        return new PortDTO(entity.getId(), entity.getName(), entity.getProvince().getId(), entity.getProvince().getName(), true);
    }
    
}



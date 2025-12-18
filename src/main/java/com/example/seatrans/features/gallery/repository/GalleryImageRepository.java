package com.example.seatrans.features.gallery.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.gallery.model.GalleryImage;
import com.example.seatrans.features.gallery.model.ImageTypeEntity;
import com.example.seatrans.features.logistics.model.ServiceTypeEntity;

/**
 * Repository for Gallery Image
 */
@Repository
public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long>, JpaSpecificationExecutor<GalleryImage> {
    
    /**
     * Find all images by service type and image type
     */
    List<GalleryImage> findByServiceTypeAndImageTypeOrderByUploadedAtDesc(
            ServiceTypeEntity serviceType, 
            ImageTypeEntity imageType
    );
    
    /**
     * Find paginated images with filters by service type and image type
     */
    Page<GalleryImage> findByServiceTypeAndImageType(
            ServiceTypeEntity serviceType,
            ImageTypeEntity imageType,
            Pageable pageable
    );
    
    /**
     * Find images by service type only
     */
    Page<GalleryImage> findByServiceType(
            ServiceTypeEntity serviceType,
            Pageable pageable
    );
    
    /**
     * Find images by image type only
     */
    Page<GalleryImage> findByImageType(
            ImageTypeEntity imageType,
            Pageable pageable
    );

    /**
     * Find all images by image type (for count)
     */
    List<GalleryImage> findByImageType(ImageTypeEntity imageType);
    
    /**
     * Count images by province, port, service type, and image type combination
     */
    long countByProvinceIdAndPortIdAndServiceTypeIdAndImageTypeId(
            Long provinceId, Long portId, Long serviceTypeId, Long imageTypeId);
    
    /**
     * Check if image URL already exists
     */
    boolean existsByImageUrl(String imageUrl);

        /**
         * Count images associated with a service type (used to prevent unsafe deletes)
         */
        long countByServiceTypeId(Long serviceTypeId);
}

package com.example.seatrans.features.gallery.model;

import java.time.LocalDateTime;

import com.example.seatrans.features.ports.model.Port;
import com.example.seatrans.features.provinces.model.Province;
import com.example.seatrans.features.logistics.model.ServiceTypeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Gallery Image Entity
 * Stores gallery images for different services and image types
 */
@Entity
@Table(name = "gallery_images", indexes = {
    @Index(name = "idx_service_type", columnList = "service_type_id"),
    @Index(name = "idx_image_type", columnList = "image_type_id"),
    @Index(name = "idx_province", columnList = "province_id"),
    @Index(name = "idx_port", columnList = "port_id"),
    @Index(name = "idx_uploaded_at", columnList = "uploaded_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryImage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id", nullable = false)
    private ServiceTypeEntity serviceType;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_type_id", nullable = false)
    private ImageTypeEntity imageType;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_id")
    private Province province;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "port_id", nullable = true)
    private Port port;
    
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;
    
    @Column(name = "uploaded_by_id", nullable = false)
    private Long uploadedById;
    
    @Column(name = "image_url", nullable = false, columnDefinition = "LONGTEXT")
    private String imageUrl;
    
    @Column(name = "cloudinary_public_id", columnDefinition = "TEXT")
    private String cloudinaryPublicId;
    
    @PrePersist
    protected void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }
}

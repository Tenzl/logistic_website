package com.example.seatrans.features.inquiry.service;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.auth.service.UserService;
import com.example.seatrans.features.inquiry.dto.InquiryDocumentDTO;
import com.example.seatrans.features.inquiry.model.InquiryDocument;
import com.example.seatrans.features.inquiry.model.InquiryDocument.DocumentType;
import com.example.seatrans.features.inquiry.repository.InquiryDocumentRepository;
import com.example.seatrans.shared.dto.CloudinaryUploadResponse;
import com.example.seatrans.shared.mapper.EntityMapper;
import com.example.seatrans.shared.service.CloudinaryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service xử lý tài liệu inquiry
 * Chuẩn doanh nghiệp với file validation, secure storage, audit trail
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InquiryDocumentService {

    @Value("${app.upload.max-file-size:10485760}") // 10 MB default
    private Long maxFileSize;

    private static final String[] ALLOWED_MIME_TYPES = {"application/pdf"};

    private final InquiryDocumentRepository documentRepository;
    private final UserService userService;
    private final CloudinaryService cloudinaryService;
    private final EntityMapper entityMapper;

    /**
     * Tải lên tài liệu cho inquiry
     * - Validate file (loại, kích thước)
     * - Tính toán checksum
     * - Lưu tệp vào hệ thống
     * - Tạo audit log
     */
    public InquiryDocumentDTO uploadDocument(String serviceSlug, Long targetId, DocumentType documentType, 
                                            MultipartFile file, String description, Long userId) throws IOException {
        
        // 1. Validation
        validateFile(file);
        
        // 2. Upload to Cloudinary
        String cloudinaryFolder = "pdf";
        CloudinaryUploadResponse cloudinaryResponse = cloudinaryService.uploadFile(file, cloudinaryFolder);
        
        // 3. Calculate checksum
        String checksum = calculateChecksum(file.getBytes());
        
        // 4. Create document entity
        User uploadedBy = userService.getUserById(userId);
        InquiryDocument document = InquiryDocument.builder()
            .serviceSlug(serviceSlug)
            .targetId(targetId)
            .documentType(documentType)
            .fileName(cloudinaryResponse.getPublicId())
            .originalFileName(file.getOriginalFilename())
            .filePath(cloudinaryResponse.getSecureUrl()) // Store Cloudinary URL
            .fileSize(file.getSize())
            .mimeType(file.getContentType())
            .description(description)
            .uploadedBy(uploadedBy)
            .checksum(checksum)
            .cloudinaryUrl(cloudinaryResponse.getSecureUrl())
            .cloudinaryPublicId(cloudinaryResponse.getPublicId())
            .version(1)
            .isActive(true)
            .build();
        
        InquiryDocument saved = documentRepository.save(document);

        log.info("Document uploaded to Cloudinary: id={}, service={}, target={}, type={}, publicId={}", 
                 saved.getId(), serviceSlug, targetId, documentType, cloudinaryResponse.getPublicId());

        return entityMapper.toInquiryDocumentDTO(saved);
    }

    /**
     * Lấy danh sách tài liệu của inquiry
     */
    @Transactional(readOnly = true)
    public List<InquiryDocumentDTO> getDocuments(String serviceSlug, Long targetId) {
        return documentRepository.findByServiceSlugAndTargetIdAndIsActiveTrue(serviceSlug, targetId)
            .stream()
            .map(entityMapper::toInquiryDocumentDTO)
            .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách tài liệu theo loại
     */
    @Transactional(readOnly = true)
    public List<InquiryDocumentDTO> getDocumentsByType(String serviceSlug, Long targetId, DocumentType documentType) {
        return documentRepository.findByServiceSlugAndTargetIdAndDocumentType(serviceSlug, targetId, documentType)
            .stream()
            .map(entityMapper::toInquiryDocumentDTO)
            .collect(Collectors.toList());
    }

    /**
     * Lấy tài liệu theo ID
     */
    @Transactional(readOnly = true)
    public InquiryDocument getDocumentById(Long documentId) {
        return documentRepository.findById(documentId)
            .orElseThrow(() -> new IllegalArgumentException("Document not found: " + documentId));
    }

    /**
     * Xóa tài liệu (soft delete)
     */
    public void deleteDocument(Long documentId) {
        InquiryDocument document = getDocumentById(documentId);
        document.setIsActive(false);
        documentRepository.save(document);
        
        log.info("Document soft-deleted: id={}, service={}, target={}", documentId, document.getServiceSlug(), document.getTargetId());
    }

    /**
     * Hard delete tài liệu (xóa từ Cloudinary và database)
     */
    public void hardDeleteDocument(Long documentId) throws IOException {
        InquiryDocument document = getDocumentById(documentId);
        
        // Delete file from Cloudinary if public ID exists
        if (document.getCloudinaryPublicId() != null && !document.getCloudinaryPublicId().isEmpty()) {
            boolean deleted = cloudinaryService.deleteFile(document.getCloudinaryPublicId());
            if (deleted) {
                log.info("File deleted from Cloudinary: {}", document.getCloudinaryPublicId());
            } else {
                log.warn("Failed to delete file from Cloudinary: {}", document.getCloudinaryPublicId());
            }
        }
        
        // Delete from database
        documentRepository.delete(document);
        log.info("Document hard-deleted: id={}", documentId);
    }

    /**
     * Validate file
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        
        // Check size
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size: " + maxFileSize);
        }
        
        // Check extension
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || !originalFileName.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }
        
        // Check MIME type
        String contentType = file.getContentType();
        if (contentType != null && !isAllowedMimeType(contentType)) {
            throw new IllegalArgumentException("Invalid file type: " + contentType);
        }
    }

    /**
     * Kiểm tra MIME type hợp lệ
     */
    private boolean isAllowedMimeType(String mimeType) {
        for (String allowed : ALLOWED_MIME_TYPES) {
            if (mimeType.equalsIgnoreCase(allowed)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Tính toán checksum SHA-256
     */
    private String calculateChecksum(byte[] fileContent) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(fileContent);
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            log.warn("Failed to calculate checksum", e);
            return null;
        }
    }
}

package com.example.seatrans.features.inquiry.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
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

    @Value("${app.upload.dir:uploads/inquiries}")
    private String uploadDir;

    @Value("${app.upload.max-file-size:10485760}") // 10 MB default
    private Long maxFileSize;

    private static final String[] ALLOWED_EXTENSIONS = {".pdf"};
    private static final String[] ALLOWED_MIME_TYPES = {"application/pdf"};
    private static final Long BUFFER_SIZE = 1024L * 1024L; // 1 MB

    private final InquiryDocumentRepository documentRepository;
    private final UserService userService;

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
        
        // 2. Generate secure file name
        String secureFileName = generateSecureFileName(file.getOriginalFilename());
        String filePath = buildFilePath(serviceSlug, targetId, secureFileName);
        
        // 4. Calculate checksum
        String checksum = calculateChecksum(file.getBytes());

        // 5. Create directory if not exists
        Path targetPath = Paths.get(filePath);
        Files.createDirectories(targetPath.getParent());

        // 6. Save file
        Files.write(targetPath, file.getBytes());
        
        // 3. Create document entity
        User uploadedBy = userService.getUserById(userId);
        InquiryDocument document = InquiryDocument.builder()
            .serviceSlug(serviceSlug)
            .targetId(targetId)
            .documentType(documentType)
            .fileName(secureFileName)
            .originalFileName(file.getOriginalFilename())
            .filePath(filePath)
            .fileSize(file.getSize())
            .mimeType(file.getContentType())
            .description(description)
            .uploadedBy(uploadedBy)
            .checksum(checksum)
            .version(1)
            .isActive(true)
            .build();
        
        InquiryDocument saved = documentRepository.save(document);

        log.info("Document uploaded successfully: id={}, service={}, target={}, type={}, file={}", 
                 saved.getId(), serviceSlug, targetId, documentType, secureFileName);

        return mapToDTO(saved);
    }

    /**
     * Lấy danh sách tài liệu của inquiry
     */
    @Transactional(readOnly = true)
    public List<InquiryDocumentDTO> getDocuments(String serviceSlug, Long targetId) {
        return documentRepository.findByServiceSlugAndTargetIdAndIsActiveTrue(serviceSlug, targetId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách tài liệu theo loại
     */
    @Transactional(readOnly = true)
    public List<InquiryDocumentDTO> getDocumentsByType(String serviceSlug, Long targetId, DocumentType documentType) {
        return documentRepository.findByServiceSlugAndTargetIdAndDocumentType(serviceSlug, targetId, documentType)
            .stream()
            .map(this::mapToDTO)
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
     * Hard delete tài liệu (xóa từ hệ thống tệp)
     */
    public void hardDeleteDocument(Long documentId) throws IOException {
        InquiryDocument document = getDocumentById(documentId);
        
        // Delete file from filesystem
        Path filePath = Paths.get(document.getFilePath());
        if (Files.exists(filePath)) {
            Files.delete(filePath);
            log.info("File deleted from filesystem: {}", document.getFilePath());
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
     * Tạo tên tệp an toàn (ngăn chặn directory traversal)
     */
    private String generateSecureFileName(String originalFileName) {
        if (originalFileName == null) {
            originalFileName = "document.pdf";
        }
        
        // Remove path components
        String fileName = Paths.get(originalFileName).getFileName().toString();
        
        // Generate random prefix
        String randomId = generateRandomId();
        
        // Remove special characters, keep only alphanumeric and dots
        String sanitized = fileName.replaceAll("[^a-zA-Z0-9.-]", "_");
        
        return randomId + "_" + sanitized;
    }

    /**
     * Tạo random ID cho tệp
     */
    private String generateRandomId() {
        byte[] randomBytes = new byte[8];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Tạo đường dẫn tệp
     */
    private String buildFilePath(String serviceSlug, Long targetId, String fileName) {
        return Paths.get(uploadDir, serviceSlug + "_" + targetId, fileName).toString();
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

    /**
     * Map entity to DTO
     */
    private InquiryDocumentDTO mapToDTO(InquiryDocument document) {
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
            .uploadedByName(document.getUploadedBy().getFullName())
            .uploadedByEmail(document.getUploadedBy().getEmail())
            .version(document.getVersion())
            .checksum(document.getChecksum())
            .isActive(document.getIsActive())
            .build();
    }
}

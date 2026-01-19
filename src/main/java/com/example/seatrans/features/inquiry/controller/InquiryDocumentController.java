package com.example.seatrans.features.inquiry.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.seatrans.features.inquiry.dto.InquiryDocumentDTO;
import com.example.seatrans.features.inquiry.model.InquiryDocument;
import com.example.seatrans.features.inquiry.model.InquiryDocument.DocumentType;
import com.example.seatrans.features.inquiry.service.InquiryDocumentService;
import com.example.seatrans.shared.dto.ApiResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * API Controller for Inquiry Document Management
 * Provides endpoints for uploading, retrieving, and deleting inquiry documents
 * 
 * Endpoints:
 * - POST   /api/v1/admin/inquiries/{serviceSlug}/{targetId}/documents (Admin Only)
 * - GET    /api/v1/inquiries/{serviceSlug}/{targetId}/documents
 * - GET    /api/v1/inquiries/{serviceSlug}/{targetId}/documents/download/{documentId}
 * - DELETE /api/v1/admin/inquiries/{serviceSlug}/{targetId}/documents/{documentId} (Admin Only)
 */
@RestController
@RequestMapping("/api/v1/inquiries")
@RequiredArgsConstructor
@Slf4j
public class InquiryDocumentController {

    private final InquiryDocumentService documentService;

    /**
     * Upload document to a service-specific inquiry (ADMIN ONLY)
     * POST /api/admin/inquiries/{serviceSlug}/{targetId}/documents
     * 
     * @param serviceSlug  Service identifier (e.g. shipping-agency)
     * @param targetId     ID of the service inquiry record
     * @param documentType Type of document (INVOICE, QUOTATION, etc.)
     * @param file         PDF file to upload
     * @param description  Optional description
     * @param principal    Current authenticated user
     * @return DocumentDTO with metadata
     */
    @PostMapping("/admin/{serviceSlug}/{targetId}/documents")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLOYEE','ROLE_INTERNAL')")
    public ResponseEntity<ApiResponse<InquiryDocumentDTO>> uploadDocument(
            @PathVariable String serviceSlug,
            @PathVariable Long targetId,
            @RequestParam DocumentType documentType,
            @RequestParam MultipartFile file,
            @RequestParam(required = false) String description,
            jakarta.servlet.http.HttpServletRequest request) {
        
        try {
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("User not authenticated"));
            }

            InquiryDocumentDTO document = documentService.uploadDocument(
                serviceSlug, targetId, documentType, file, description, userId);
            
            return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully", document));
        } catch (IOException e) {
            log.error("Failed to upload document for {} {}", serviceSlug, targetId, e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to upload document: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid document upload request for {} {}: {}", serviceSlug, targetId, e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all documents for a service-specific inquiry
     * GET /api/inquiries/{serviceSlug}/{targetId}/documents
     * 
     * @param serviceSlug Service identifier
     * @param targetId    ID of the service inquiry record
     * @return List of DocumentDTOs
     */
    @GetMapping("/{serviceSlug}/{targetId}/documents")
    public ResponseEntity<ApiResponse<List<InquiryDocumentDTO>>> getDocuments(
            @PathVariable String serviceSlug,
            @PathVariable Long targetId) {
        
        List<InquiryDocumentDTO> documents = documentService.getDocuments(serviceSlug, targetId);
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved successfully", documents));
    }

    /**
     * Get documents by type for a service-specific inquiry
     * GET /api/inquiries/{serviceSlug}/{targetId}/documents?type=INVOICE
     * 
     * @param serviceSlug Service identifier
     * @param targetId    ID of the service inquiry record
     * @param type        Document type filter
     * @return List of DocumentDTOs filtered by type
     */
    @GetMapping("/{serviceSlug}/{targetId}/documents/by-type")
    public ResponseEntity<ApiResponse<List<InquiryDocumentDTO>>> getDocumentsByType(
            @PathVariable String serviceSlug,
            @PathVariable Long targetId,
            @RequestParam DocumentType type) {
        
        List<InquiryDocumentDTO> documents = documentService.getDocumentsByType(serviceSlug, targetId, type);
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved successfully", documents));
    }

    /**
     * Download document file
     * GET /api/inquiries/{serviceSlug}/{targetId}/documents/download/{documentId}
     * 
     * @param serviceSlug Service identifier
     * @param targetId    ID of the service inquiry record
     * @param documentId  ID of the document
     * @return File content as PDF
     */
    @GetMapping("/{serviceSlug}/{targetId}/documents/download/{documentId}")
    public ResponseEntity<?> downloadDocument(
            @PathVariable String serviceSlug,
            @PathVariable Long targetId,
            @PathVariable Long documentId) {
        return serveFile(serviceSlug, targetId, documentId);
    }

    /**
     * Preview document file (Bypass IDM interception by not using 'download' keyword)
     * GET /api/inquiries/{serviceSlug}/{targetId}/documents/view/{documentId}
     */
    @GetMapping("/{serviceSlug}/{targetId}/documents/view/{documentId}")
    public ResponseEntity<?> previewDocument(
            @PathVariable String serviceSlug,
            @PathVariable Long targetId,
            @PathVariable Long documentId) {
        
         try {
            InquiryDocument document = documentService.getDocumentById(documentId);
            
            if (!document.getServiceSlug().equals(serviceSlug) || !document.getTargetId().equals(targetId)) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Document does not belong to the specified inquiry"));
            }
            
            Path filePath = Paths.get(document.getFilePath());
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] fileContent = Files.readAllBytes(filePath);

            return ResponseEntity.ok()
                // Use generic type to avoid IDM detection (react-pdf can still parse it)
                .header(HttpHeaders.CONTENT_TYPE, "application/octet-stream")
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileContent.length))
                .body(fileContent);
            
        } catch (IOException e) {
            log.error("Failed to download document {}", documentId, e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to download document"));
        } catch (IllegalArgumentException e) {
            log.warn("Document not found: {}", documentId);
            return ResponseEntity.notFound().build();
        }
    }

    private ResponseEntity<?> serveFile(String serviceSlug, Long targetId, Long documentId) {
        try {
            InquiryDocument document = documentService.getDocumentById(documentId);
            
            if (!document.getServiceSlug().equals(serviceSlug) || !document.getTargetId().equals(targetId)) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Document does not belong to the specified inquiry"));
            }
            
            Path filePath = Paths.get(document.getFilePath());
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] fileContent = Files.readAllBytes(filePath);

            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "inline; filename=\"" + document.getOriginalFileName() + "\"")
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileContent.length))
                .body(fileContent);
            
        } catch (IOException e) {
            log.error("Failed to download document {}", documentId, e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to download document"));
        } catch (IllegalArgumentException e) {
            log.warn("Document not found: {}", documentId);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete document (ADMIN ONLY)
     * DELETE /api/admin/inquiries/{serviceSlug}/{targetId}/documents/{documentId}
     * 
     * @param serviceSlug Service identifier
     * @param targetId    ID of the service inquiry record
     * @param documentId  ID of the document to delete
     * @return Success response
     */
    @DeleteMapping("/admin/{serviceSlug}/{targetId}/documents/{documentId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLOYEE','ROLE_INTERNAL')")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable String serviceSlug,
            @PathVariable Long targetId,
            @PathVariable Long documentId) {
        
        try {
            InquiryDocument document = documentService.getDocumentById(documentId);
            
            if (!document.getServiceSlug().equals(serviceSlug) || !document.getTargetId().equals(targetId)) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.<Void>error("Document does not belong to the specified inquiry"));
            }
            
            documentService.deleteDocument(documentId);
            return ResponseEntity.ok(ApiResponse.<Void>success("Document deleted successfully", null));
            
        } catch (IllegalArgumentException e) {
            log.warn("Document not found: {}", documentId);
            return ResponseEntity.notFound().build();
        }
    }
}

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
     * Convert stored Cloudinary URL to raw delivery (needed for PDFs uploaded as raw).
     * If url is null/blank, returns null.
     */
    private String buildCloudinaryPdfUrl(String storedUrl) {
        if (storedUrl == null || storedUrl.isBlank()) {
            return null;
        }
        // If already raw delivery, keep as-is
        if (storedUrl.contains("/raw/upload/")) {
            return storedUrl;
        }
        // If it was uploaded as image/upload but actually is a PDF, switch to raw/upload path
        return storedUrl.replace("/image/upload/", "/raw/upload/");
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
     * 
     * This endpoint proxies the file content to avoid CORS issues with Cloudinary
     * and to support PDF.js which cannot follow 302 redirects properly.
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
            
            // If stored on Cloudinary, proxy the file content instead of redirecting
            // This avoids CORS issues and allows PDF.js to properly load the file
            String cloudinaryUrl = document.getCloudinaryUrl();
            if (cloudinaryUrl != null && !cloudinaryUrl.isBlank()) {
                try {
                    // Fetch the file from Cloudinary and proxy it
                    java.net.URL url = new java.net.URL(cloudinaryUrl);
                    java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                    conn.setConnectTimeout(10000);
                    conn.setReadTimeout(30000);
                    
                    int responseCode = conn.getResponseCode();
                    if (responseCode == 200) {
                        byte[] fileContent = conn.getInputStream().readAllBytes();
                        conn.disconnect();
                        
                        return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE)
                            .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileContent.length))
                            .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400") // Cache for 1 day
                            .body(fileContent);
                    } else {
                        conn.disconnect();
                        log.warn("Cloudinary returned {} for document {}", responseCode, documentId);
                        return ResponseEntity.status(responseCode)
                            .body(ApiResponse.error("Failed to fetch document from storage"));
                    }
                } catch (Exception e) {
                    log.error("Failed to proxy document from Cloudinary: {}", documentId, e);
                    return ResponseEntity.status(500)
                        .body(ApiResponse.error("Failed to fetch document from storage"));
                }
            }
            
            Path filePath = Paths.get(document.getFilePath());
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] fileContent = Files.readAllBytes(filePath);

            return ResponseEntity.ok()
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

    private ResponseEntity<?> serveFile(String serviceSlug, Long targetId, Long documentId) {
        try {
            InquiryDocument document = documentService.getDocumentById(documentId);
            
            if (!document.getServiceSlug().equals(serviceSlug) || !document.getTargetId().equals(targetId)) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Document does not belong to the specified inquiry"));
            }
            
            // If stored on Cloudinary, redirect to raw delivery URL (PDFs require raw resource type)
            String cloudinaryUrl = buildCloudinaryPdfUrl(document.getCloudinaryUrl());
            if (cloudinaryUrl != null) {
                return ResponseEntity.status(302)
                    .header(HttpHeaders.LOCATION, cloudinaryUrl)
                    .build();
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

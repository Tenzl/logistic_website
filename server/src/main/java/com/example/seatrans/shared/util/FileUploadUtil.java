package com.example.seatrans.shared.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;

/**
 * Utility class for file upload operations
 */
@Component
@Slf4j
public class FileUploadUtil {
    
    @Value("${app.upload.dir:uploads/gallery}")
    private String uploadDir;
    
    @Value("${app.upload.max-file-size:5242880}") // 5MB default
    private long maxFileSize;
    
    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(Arrays.asList("jpg", "jpeg", "png", "webp"));
    private static final Set<String> ALLOWED_MIME_TYPES = new HashSet<>(Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp"
    ));
    
    /**
     * Validate uploaded file
     * Returns error message if invalid, null if valid
     */
    public String validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return "File is required";
        }
        
        // Check file size
        if (file.getSize() > maxFileSize) {
            return "File size exceeds maximum limit of " + (maxFileSize / 1024 / 1024) + "MB";
        }
        
        // Check file extension
        String filename = file.getOriginalFilename();
        if (filename == null) {
            return "Invalid filename";
        }
        
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            return "Invalid file format. Allowed: JPG, PNG, WebP";
        }
        
        // Check MIME type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
            return "Invalid file MIME type";
        }
        
        return null; // Valid
    }
    
    /**
     * Calculate MD5 hash of file content
     */
    private String calculateFileHash(byte[] fileBytes) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] hashBytes = md.digest(fileBytes);
        StringBuilder sb = new StringBuilder();
        for (byte b : hashBytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
    
    /**
     * Get hash of uploaded file
     */
    public String getFileHash(MultipartFile file) throws IOException {
        try {
            byte[] fileBytes = file.getBytes();
            return calculateFileHash(fileBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IOException("Failed to calculate file hash", e);
        }
    }
    
    /**
     * Save uploaded file and return relative URL
     */
    public String saveFile(MultipartFile file, String serviceType, String imageType) throws IOException {
        try {
            // Calculate hash of file content
            byte[] fileBytes = file.getBytes();
            String fileHash = calculateFileHash(fileBytes);
            
            // Create directory structure
            String fileName = fileHash + "." + getFileExtension(file.getOriginalFilename());
            String uploadPath = uploadDir + File.separator + serviceType + File.separator + imageType;
        
        Path uploadDirectory = Paths.get(uploadPath);
        if (!Files.exists(uploadDirectory)) {
            Files.createDirectories(uploadDirectory);
        }
        
        Path filePath = uploadDirectory.resolve(fileName);
        Files.write(filePath, fileBytes);
        
        log.info("File saved successfully: {}", filePath);
        
        // Return relative URL for storage (always use forward slashes for URLs)
        String relativePath = uploadPath + File.separator + fileName;
        return relativePath.replace("\\", "/");
        } catch (NoSuchAlgorithmException e) {
            log.error("Error calculating file hash", e);
            throw new IOException("Failed to calculate file hash", e);
        }
    }
    
    /**
     * Delete file
     */
    public boolean deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("File deleted successfully: {}", filePath);
                return true;
            }
        } catch (IOException e) {
            log.error("Error deleting file: {}", filePath, e);
        }
        return false;
    }
    
    /**
     * Get file extension
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}

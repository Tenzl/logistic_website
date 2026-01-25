package com.example.seatrans.shared.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.example.seatrans.shared.dto.CloudinaryUploadResponse;
import com.example.seatrans.shared.exception.FileUploadException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
        "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    /**
     * Upload a single file to Cloudinary
     */
    public CloudinaryUploadResponse uploadFile(MultipartFile file, String folder) {
        validateFile(file);
        
        try {
            Map<String, Object> uploadParams = new HashMap<>();
            uploadParams.put("folder", folder);
            uploadParams.put("resource_type", "auto");
            uploadParams.put("overwrite", true);
            
            // Generate unique filename (folder is already set above)
            String uniqueFilename = generateUniqueFilename(file.getOriginalFilename());
            uploadParams.put("public_id", uniqueFilename);

            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            
            return mapToResponse(uploadResult, file.getOriginalFilename());
            
        } catch (IOException e) {
            log.error("Failed to upload file to Cloudinary: {}", e.getMessage(), e);
            throw new FileUploadException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Upload multiple files to Cloudinary (parallel upload)
     */
    public List<CloudinaryUploadResponse> uploadMultipleFiles(List<MultipartFile> files, String folder) {
        if (files == null || files.isEmpty()) {
            throw new FileUploadException("No files provided for upload");
        }

        log.info("Starting upload of {} files to folder: {}", files.size(), folder);

        // Upload files in parallel using CompletableFuture
        List<CompletableFuture<CloudinaryUploadResponse>> futures = files.stream()
            .map(file -> CompletableFuture.supplyAsync(() -> uploadFile(file, folder)))
            .toList();

        // Wait for all uploads to complete
        CompletableFuture<Void> allOf = CompletableFuture.allOf(
            futures.toArray(CompletableFuture[]::new)
        );

        // Get results
        return allOf.thenApply(v -> 
            futures.stream()
                .map(CompletableFuture::join)
                .toList()
        ).join();
    }

    /**
     * Delete a file from Cloudinary by public ID
     */
    public boolean deleteFile(String publicId) {
        try {
            Map<String, Object> result = cloudinary.uploader().destroy(
                publicId,
                Map.of("invalidate", true) // xóa cache CDN
            );
            String deleteResult = (String) result.get("result");
            
            log.info("Delete result for {}: {}", publicId, deleteResult);
            return "ok".equals(deleteResult);
            
        } catch (Exception e) {
            log.error("Failed to delete file from Cloudinary: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Delete multiple files from Cloudinary (Bulk delete)
     */
    public Map<String, Boolean> deleteMultipleFiles(List<String> publicIds) {
        if (publicIds == null || publicIds.isEmpty()) {
            return Map.of();
        }

        try {
            // Sử dụng API deleteResources cho bulk delete
            Map<?, ?> result = cloudinary.api().deleteResources(
                publicIds,
                Map.of("invalidate", true) // xóa cache CDN
            );
            
            log.info("Bulk delete result: {}", result);
            
            // Parse kết quả từ deleted map
            Map<String, Boolean> results = new HashMap<>();
            @SuppressWarnings("unchecked")
            Map<String, String> deleted = (Map<String, String>) result.get("deleted");
            
            if (deleted != null) {
                for (String publicId : publicIds) {
                    results.put(publicId, deleted.containsKey(publicId) && "deleted".equals(deleted.get(publicId)));
                }
            } else {
                // Nếu không có deleted map, đánh dấu tất cả là false
                publicIds.forEach(id -> results.put(id, false));
            }
            
            return results;
            
        } catch (Exception e) {
            log.error("Failed to bulk delete files from Cloudinary: {}", e.getMessage(), e);
            Map<String, Boolean> results = new HashMap<>();
            publicIds.forEach(id -> results.put(id, false));
            return results;
        }
    }

    /**
     * Validate file before upload
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileUploadException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileUploadException(
                String.format("File size exceeds maximum allowed size of %d MB", MAX_FILE_SIZE / (1024 * 1024))
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new FileUploadException(
                "Invalid file type. Allowed types: " + String.join(", ", ALLOWED_IMAGE_TYPES)
            );
        }
    }

    /**
     * Generate unique filename
     */
    private String generateUniqueFilename(String originalFilename) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String randomString = UUID.randomUUID().toString().substring(0, 8);
        
        if (originalFilename != null && originalFilename.contains(".")) {
            String nameWithoutExt = originalFilename.substring(0, originalFilename.lastIndexOf('.'));
            String sanitizedName = nameWithoutExt.replaceAll("[^a-zA-Z0-9-_]", "_");
            return sanitizedName + "_" + timestamp + "_" + randomString;
        }
        
        return timestamp + "_" + randomString;
    }

    /**
     * Map Cloudinary upload result to response DTO
     */
    private CloudinaryUploadResponse mapToResponse(Map<String, Object> uploadResult, String originalFilename) {
        return CloudinaryUploadResponse.builder()
            .publicId((String) uploadResult.get("public_id"))
            .url((String) uploadResult.get("url"))
            .secureUrl((String) uploadResult.get("secure_url"))
            .format((String) uploadResult.get("format"))
            .bytes(((Number) uploadResult.get("bytes")).longValue())
            .width((Integer) uploadResult.get("width"))
            .height((Integer) uploadResult.get("height"))
            .resourceType((String) uploadResult.get("resource_type"))
            .originalFilename(originalFilename)
            .build();
    }

    /**
     * Get optimized image URL with transformations
     */
    public String getOptimizedImageUrl(String publicId, int width, int height) {
        return cloudinary.url()
            .transformation(new Transformation()
                .width(width)
                .height(height)
                .crop("fill")
                .quality("auto")
                .fetchFormat("auto"))
            .generate(publicId);
    }
}

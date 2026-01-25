package com.example.seatrans.features.post.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.seatrans.features.post.dto.PostRequest;
import com.example.seatrans.features.post.dto.PostResponse;
import com.example.seatrans.features.post.service.PostService;
import com.example.seatrans.shared.dto.ApiResponse;
import com.example.seatrans.shared.dto.CloudinaryUploadResponse;
import com.example.seatrans.shared.service.CloudinaryService;
import com.example.seatrans.shared.util.FileUploadUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for Post management (Admin Only)
 * Requires ROLE_INTERNAL
 */
@RestController
@RequestMapping("/api/v1/admin/posts")
@RequiredArgsConstructor
@Validated
@Slf4j
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLOYEE','ROLE_INTERNAL')")
public class PostController {
    
    private final PostService postService;
    private final FileUploadUtil fileUploadUtil;
    private final CloudinaryService cloudinaryService;
    
    /**
     * Get all posts (admin view - includes unpublished)
     * GET /api/admin/posts
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PostResponse>>> getAllPosts() {
        log.info("Admin fetching all posts");
        List<PostResponse> posts = postService.getAllPosts();
        return ResponseEntity.ok(ApiResponse.success("Posts retrieved successfully", posts));
    }
    
    /**
     * Get post by ID
     * GET /api/admin/posts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPostById(@PathVariable Long id) {
        log.info("Fetching post with ID: {}", id);
        PostResponse post = postService.getPostById(id);
        return ResponseEntity.ok(ApiResponse.success("Post retrieved successfully", post));
    }
    
    /**
     * Create new post
     * POST /api/admin/posts
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @Valid @RequestBody PostRequest request,
            Principal principal) {
        log.info("Creating new post: {}", request.getTitle());
        String email = principal.getName();
        PostResponse post = postService.createPost(request, email);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Post created successfully", post));
    }
    
    /**
     * Update existing post
     * PUT /api/admin/posts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request) {
        log.info("Updating post with ID: {}", id);
        PostResponse post = postService.updatePost(id, request);
        return ResponseEntity.ok(ApiResponse.success("Post updated successfully", post));
    }
    
    /**
     * Delete post
     * DELETE /api/admin/posts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        log.info("Deleting post with ID: {}", id);
        postService.deletePost(id);
        return ResponseEntity.ok(ApiResponse.success("Post deleted successfully", null));
    }
    
    /**
     * Publish a post
     * POST /api/admin/posts/{id}/publish
     */
    @PostMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<PostResponse>> publishPost(@PathVariable Long id) {
        log.info("Publishing post with ID: {}", id);
        PostResponse post = postService.publishPost(id);
        return ResponseEntity.ok(ApiResponse.success("Post published successfully", post));
    }
    
    /**
     * Unpublish a post
     * POST /api/admin/posts/{id}/unpublish
     */
    @PostMapping("/{id}/unpublish")
    public ResponseEntity<ApiResponse<PostResponse>> unpublishPost(@PathVariable Long id) {
        log.info("Unpublishing post with ID: {}", id);
        PostResponse post = postService.unpublishPost(id);
        return ResponseEntity.ok(ApiResponse.success("Post unpublished successfully", post));
    }

    /**
     * Upload image for post content
         * POST /api/admin/posts/upload-image
     */
    @PostMapping("/upload-image")
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "postId", required = false) Long postId) {
        try {
            String error = fileUploadUtil.validateFile(file);
            if (error != null) {
                return ResponseEntity.badRequest().body(ApiResponse.error(error));
            }
            // Upload to Cloudinary and persist metadata
            CloudinaryUploadResponse uploadResponse = cloudinaryService.uploadFile(file, "post/content");
            postService.savePostImage(postId, uploadResponse.getSecureUrl(), uploadResponse.getPublicId());
            
            return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", uploadResponse.getSecureUrl()));
        } catch (Exception e) {
            log.error("Error uploading image", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to upload image"));
        }
    }

    /**
     * Upload thumbnail for a post
     * POST /api/admin/posts/upload-thumbnail
     */
    @PostMapping("/upload-thumbnail")
    public ResponseEntity<ApiResponse<CloudinaryUploadResponse>> uploadThumbnail(
            @RequestParam("file") MultipartFile file) {
        try {
            String error = fileUploadUtil.validateFile(file);
            if (error != null) {
                return ResponseEntity.badRequest().body(ApiResponse.error(error));
            }

            CloudinaryUploadResponse uploadResponse = cloudinaryService.uploadFile(file, "post/thumbnail");
            return ResponseEntity.ok(ApiResponse.success("Thumbnail uploaded successfully", uploadResponse));
        } catch (Exception e) {
            log.error("Error uploading thumbnail", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to upload thumbnail"));
        }
    }
}

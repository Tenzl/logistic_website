package com.example.seatrans.features.post.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.shared.dto.ApiResponse;
import com.example.seatrans.features.post.dto.PostResponse;
import com.example.seatrans.features.post.service.PostService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Public controller for posts (no authentication required)
 */
@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
@Slf4j
public class PostPublicController {
    
    private final PostService postService;
    
    /**
     * Get all published posts
     * GET /api/v1/posts
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PostResponse>>> getPublishedPosts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        log.info("Fetching published posts - category: {}, search: {}", category, search);
        
        List<PostResponse> posts;
        
        if (search != null && !search.trim().isEmpty()) {
            posts = postService.searchPosts(search);
        } else if (category != null && !category.trim().isEmpty()) {
            posts = postService.getPostsByCategory(category);
        } else {
            posts = postService.getAllPublishedPosts();
        }
        
        return ResponseEntity.ok(ApiResponse.success("Posts retrieved successfully", posts));
    }
    
    /**
     * Get published posts with pagination
     * GET /api/posts/paginated
     */
    @GetMapping("/paginated")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getPublishedPostsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Fetching paginated posts - page: {}, size: {}", page, size);
        Page<PostResponse> posts = postService.getPublishedPostsPaginated(page, size);
        return ResponseEntity.ok(ApiResponse.success("Posts retrieved successfully", posts));
    }
    
    /**
     * Get post by ID (increments view count)
     * GET /api/posts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPostById(@PathVariable Long id) {
        log.info("Fetching post with ID: {} (incrementing view count)", id);
        PostResponse post = postService.getPostByIdWithViewCount(id);
        return ResponseEntity.ok(ApiResponse.success("Post retrieved successfully", post));
    }
    
    /**
     * Get latest published posts
     * GET /api/posts/latest
     */
    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getLatestPosts(
            @RequestParam(defaultValue = "5") int limit) {
        log.info("Fetching latest {} posts", limit);
        List<PostResponse> posts = postService.getLatestPosts(limit);
        return ResponseEntity.ok(ApiResponse.success("Latest posts retrieved successfully", posts));
    }
}

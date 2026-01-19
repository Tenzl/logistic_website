package com.example.seatrans.features.post.controller;

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
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.post.dto.CategoryRequest;
import com.example.seatrans.features.post.dto.CategoryResponse;
import com.example.seatrans.features.post.service.CategoryService;
import com.example.seatrans.shared.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for Category management
 * Public endpoints for reading, Admin endpoints for CRUD
 */
@RestController
@RequiredArgsConstructor
@Validated
@Slf4j
public class CategoryController {
    
    private final CategoryService categoryService;
    
    /**
     * Get all categories (Public)
     * GET /api/v1/categories
     */
    @GetMapping("/api/v1/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        log.info("Public: Fetching all categories");
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }
    
    /**
     * Get all categories (Admin)
     * GET /api/v1/admin/categories
     */
    @GetMapping("/api/v1/admin/categories")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLOYEE','ROLE_INTERNAL')")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAdminCategories() {
        log.info("Admin: Fetching all categories");
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }
    
    /**
     * Get category by ID
     * GET /api/v1/admin/categories/{id}
     */
    @GetMapping("/api/v1/admin/categories/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLOYEE','ROLE_INTERNAL')")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        log.info("Fetching category with ID: {}", id);
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", category));
    }
    
    /**
     * Create new category
     * POST /api/v1/admin/categories
     */
    @PostMapping("/api/v1/admin/categories")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLOYEE','ROLE_INTERNAL')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        log.info("Creating new category: {}", request.getName());
        CategoryResponse category = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Category created successfully", category));
    }
    
    /**
     * Update existing category
     * PUT /api/v1/admin/categories/{id}
     */
    @PutMapping("/api/v1/admin/categories/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLOYEE','ROLE_INTERNAL')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        log.info("Updating category with ID: {}", id);
        CategoryResponse category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", category));
    }
    
    /**
     * Delete category
     * DELETE /api/v1/admin/categories/{id}
     */
    @DeleteMapping("/api/v1/admin/categories/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_EMPLOYEE','ROLE_INTERNAL')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        log.info("Deleting category with ID: {}", id);
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
}

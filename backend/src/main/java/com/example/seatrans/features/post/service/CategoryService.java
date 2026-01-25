package com.example.seatrans.features.post.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.seatrans.features.post.dto.CategoryRequest;
import com.example.seatrans.features.post.dto.CategoryResponse;
import com.example.seatrans.features.post.model.Category;
import com.example.seatrans.features.post.repository.CategoryRepository;
import com.example.seatrans.shared.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    /**
     * Get all categories
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        log.info("Fetching all categories");
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get category by ID
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        log.info("Fetching category with ID: {}", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        return mapToResponse(category);
    }
    
    /**
     * Create new category
     */
    public CategoryResponse createCategory(CategoryRequest request) {
        log.info("Creating new category: {}", request.getName());
        
        // Check if category name already exists
        if (categoryRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Category with name '" + request.getName() + "' already exists");
        }
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Category with slug '" + request.getSlug() + "' already exists");
        }
        
        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .build();
        
        Category saved = categoryRepository.save(category);
        log.info("Category created successfully with ID: {}", saved.getId());
        return mapToResponse(saved);
    }
    
    /**
     * Update existing category
     */
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        log.info("Updating category with ID: {}", id);
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        
        // Check if new name conflicts with existing category
        if (!category.getName().equals(request.getName()) && 
            categoryRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Category with name '" + request.getName() + "' already exists");
        }
        if (!category.getSlug().equals(request.getSlug()) &&
            categoryRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Category with slug '" + request.getSlug() + "' already exists");
        }
        
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        
        Category updated = categoryRepository.save(category);
        log.info("Category updated successfully");
        return mapToResponse(updated);
    }
    
    /**
     * Delete category
     */
    public void deleteCategory(Long id) {
        log.info("Deleting category with ID: {}", id);
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        
        categoryRepository.delete(category);
        log.info("Category deleted successfully");
    }
    
    /**
     * Map Category entity to CategoryResponse DTO
     */
    private CategoryResponse mapToResponse(Category category) {
        long postCount = categoryRepository.countByPostCategoriesCategoryId(category.getId());
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt().toString())
            .postCount(postCount)
                .build();
    }
}

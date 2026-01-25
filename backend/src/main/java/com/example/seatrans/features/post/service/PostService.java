package com.example.seatrans.features.post.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.auth.repository.UserRepository;
import com.example.seatrans.features.post.dto.CategoryResponse;
import com.example.seatrans.features.post.dto.PostRequest;
import com.example.seatrans.features.post.dto.PostResponse;
import com.example.seatrans.features.post.model.Category;
import com.example.seatrans.features.post.model.Post;
import com.example.seatrans.features.post.model.PostCategory;
import com.example.seatrans.features.post.model.PostImage;
import com.example.seatrans.features.post.repository.CategoryRepository;
import com.example.seatrans.features.post.repository.PostImageRepository;
import com.example.seatrans.features.post.repository.PostRepository;
import com.example.seatrans.shared.service.CloudinaryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for Post management
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PostService {
    
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostImageRepository postImageRepository;
    private final CategoryRepository categoryRepository;
    private final CloudinaryService cloudinaryService;
    
    /**
     * Create a new post
     */
    public PostResponse createPost(PostRequest request, String email) {
        log.info("Creating post with title: {}", request.getTitle());
        
        validateThumbnail(request);

        User author = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Author not found"));
        
        Post post = Post.builder()
            .title(request.getTitle())
            .content(request.getContent())
            .author(author)
            .thumbnailUrl(request.getThumbnailUrl())
            .thumbnailPublicId(request.getThumbnailPublicId())
            .isPublished(Boolean.TRUE.equals(request.getIsPublished()))
            .build();
        
        if (post.getIsPublished()) {
            post.setPublishedAt(LocalDateTime.now());
        }
        
        Post savedPost = postRepository.save(post);
        
        // Handle categories
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            for (Long categoryId : request.getCategoryIds()) {
                Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found: " + categoryId));
                PostCategory postCategory = PostCategory.builder()
                    .post(savedPost)
                    .category(category)
                    .build();
                savedPost.getPostCategories().add(postCategory);
            }
            savedPost = postRepository.save(savedPost);
        }
        
        log.info("Post created with ID: {}", savedPost.getId());
        
        return toResponse(savedPost);
    }
    
    /**
     * Update an existing post
     */
    public PostResponse updatePost(Long id, PostRequest request) {
        log.info("Updating post with ID: {}", id);
        
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));

        validateThumbnail(request);
        
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());

        // Replace thumbnail only when a new one is provided
        if (request.getThumbnailUrl() != null || request.getThumbnailPublicId() != null) {
            String oldPublicId = post.getThumbnailPublicId();
            String newPublicId = request.getThumbnailPublicId();

            if (newPublicId != null && !Objects.equals(oldPublicId, newPublicId) && oldPublicId != null) {
                cloudinaryService.deleteFile(oldPublicId);
            }

            if (request.getThumbnailUrl() != null) {
                post.setThumbnailUrl(request.getThumbnailUrl());
            }
            if (request.getThumbnailPublicId() != null) {
                post.setThumbnailPublicId(request.getThumbnailPublicId());
            }
        }
        
        // Handle publish status change
        if (request.getIsPublished() != null && !request.getIsPublished().equals(post.getIsPublished())) {
            if (Boolean.TRUE.equals(request.getIsPublished())) {
                post.publish();
            } else {
                post.unpublish();
            }
        }
        
        // Update categories
        if (request.getCategoryIds() != null) {
            // Clear existing categories
            post.getPostCategories().clear();
            
            // Add new categories
            for (Long categoryId : request.getCategoryIds()) {
                Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found: " + categoryId));
                PostCategory postCategory = PostCategory.builder()
                    .post(post)
                    .category(category)
                    .build();
                post.getPostCategories().add(postCategory);
            }
        }
        
        Post updatedPost = postRepository.save(post);
        log.info("Post updated: {}", updatedPost.getId());
        
        return toResponse(updatedPost);
    }
    
    /**
     * Delete a post
     */
    public void deletePost(Long id) {
        log.info("Deleting post with ID: {}", id);
        
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));

        // Remove thumbnail from Cloudinary if present
        if (post.getThumbnailPublicId() != null) {
            cloudinaryService.deleteFile(post.getThumbnailPublicId());
        }

        // Remove post images from Cloudinary if present
        if (post.getImages() != null) {
            post.getImages().stream()
                .map(PostImage::getCloudinaryPublicId)
                .filter(Objects::nonNull)
                .forEach(cloudinaryService::deleteFile);
        }

        postRepository.delete(post);
        log.info("Post deleted: {}", id);
    }
    
    /**
     * Get post by ID
     */
    @Transactional(readOnly = true)
    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        
        return toResponse(post);
    }
    
    /**
     * Get post by ID and increment view count (atomic, thread-safe)
     */
    @Transactional
    public PostResponse getPostByIdWithViewCount(Long id) {
        // Verify post exists
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        
        // Atomic increment - prevents race conditions
        postRepository.incrementViewCount(id);
        
        // Refresh post to get updated view count
        postRepository.flush();
        post = postRepository.findById(id).orElseThrow();
        
        return toResponse(post);
    }
    
    /**
     * Get all posts (for admin)
     */
    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts() {
        List<Post> posts = postRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return posts.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get all published posts
     */
    @Transactional(readOnly = true)
    public List<PostResponse> getAllPublishedPosts() {
        List<Post> posts = postRepository.findByIsPublishedTrueOrderByPublishedAtDesc();
        return posts.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get published posts with pagination
     */
    @Transactional(readOnly = true)
    public Page<PostResponse> getPublishedPostsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<Post> posts = postRepository.findByIsPublishedTrue(pageable);
        List<PostResponse> content = posts.getContent().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return new PageImpl<>(content, pageable, posts.getTotalElements());
    }
    
    /**
     * Get posts by category
     */
    @Transactional(readOnly = true)
    public List<PostResponse> getPostsByCategory(String category) {
        List<Post> posts = postRepository.findByIsPublishedTrueAndCategoryOrderByPublishedAtDesc(category);
        return posts.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Search posts by keyword
     */
    @Transactional(readOnly = true)
    public List<PostResponse> searchPosts(String keyword) {
        List<Post> posts = postRepository.searchPublishedByKeyword(keyword);
        return posts.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get latest published posts
     */
    @Transactional(readOnly = true)
    public List<PostResponse> getLatestPosts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Post> posts = postRepository.findLatestPublished(pageable);
        return posts.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Publish a post
     */
    public PostResponse publishPost(Long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        
        post.publish();
        Post publishedPost = postRepository.save(post);
        log.info("Post published: {}", publishedPost.getId());
        
        return toResponse(publishedPost);
    }
    
    /**
     * Unpublish a post
     */
    public PostResponse unpublishPost(Long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        
        post.unpublish();
        Post unpublishedPost = postRepository.save(post);
        log.info("Post unpublished: {}", unpublishedPost.getId());
        
        return toResponse(unpublishedPost);
    }

    /**
     * Save post image
     */
    public void savePostImage(Long postId, String url, String cloudinaryPublicId) {
        // Validate Cloudinary URL and publicId
        if (url == null || cloudinaryPublicId == null) {
            throw new RuntimeException("Ảnh post phải có URL và publicId từ Cloudinary");
        }
        
        if (!isCloudinaryUrl(url)) {
            throw new RuntimeException("Ảnh post phải được upload qua Cloudinary");
        }

        if (postId != null) {
            Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
            
            PostImage postImage = PostImage.builder()
                .post(post)
                .url(url)
                .cloudinaryPublicId(cloudinaryPublicId)
                .build();
            
            postImageRepository.save(postImage);
        } else {
            // If no post ID, we just save the image record without a post link for now
            PostImage postImage = PostImage.builder()
                .url(url)
                .cloudinaryPublicId(cloudinaryPublicId)
                .build();
            postImageRepository.save(postImage);
        }
    }
    
    /**
     * Convert Post entity to PostResponse DTO
     */
    private PostResponse toResponse(Post post) {
        List<CategoryResponse> categories = post.getPostCategories().stream()
            .map(pc -> CategoryResponse.builder()
                .id(pc.getCategory().getId())
                .name(pc.getCategory().getName())
                .description(pc.getCategory().getDescription())
                .build())
            .collect(Collectors.toList());
        
        return PostResponse.builder()
            .id(post.getId())
            .title(post.getTitle())
            .content(post.getContent())
            .authorId(post.getAuthor().getId())
            .authorName(post.getAuthor().getFullName() != null ? post.getAuthor().getFullName() : post.getAuthor().getEmail())
            .categories(categories)
            .thumbnailUrl(post.getThumbnailUrl())
            .thumbnailPublicId(post.getThumbnailPublicId())
            .publishedAt(post.getPublishedAt())
            .isPublished(post.getIsPublished())
            .viewCount(post.getViewCount())
            .createdAt(post.getCreatedAt())
            .updatedAt(post.getUpdatedAt())
            .build();
    }

    /**
     * Ensure thumbnail info is Cloudinary-only and consistent
     */
    private void validateThumbnail(PostRequest request) {
        String url = request.getThumbnailUrl();
        String publicId = request.getThumbnailPublicId();

        // If either is provided, both must be provided
        if ((url == null) != (publicId == null)) {
            throw new RuntimeException("Thumbnail URL và publicId phải được cung cấp cùng nhau");
        }

        if (url != null && !isCloudinaryUrl(url)) {
            throw new RuntimeException("Thumbnail phải được upload qua Cloudinary");
        }
    }

    private boolean isCloudinaryUrl(String url) {
        String lower = url.toLowerCase();
        return lower.contains("cloudinary.com");
    }
}


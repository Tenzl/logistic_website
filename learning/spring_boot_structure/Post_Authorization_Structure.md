# Cấu Trúc Phân Quyền Đăng Bài - Internal Group Only

## Tổng Quan
Hệ thống cho phép **chỉ internal group** (nhân viên nội bộ) tạo bài post, trong khi external group (khách hàng) chỉ được xem và tương tác.

---

## 1. Cấu Trúc Entity

### 1.1 Post Entity
```java
@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author; // Phải là User thuộc INTERNAL group
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus status; // DRAFT, PUBLISHED, ARCHIVED
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostCategory category; // ANNOUNCEMENT, NEWS, POLICY, GUIDE
    
    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;
    
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

### 1.2 PostComment Entity (Tất cả users có thể comment)
```java
@Entity
@Table(name = "post_comments")
public class PostComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User commenter; // Cả INTERNAL và EXTERNAL đều comment được
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

### 1.3 PostLike Entity (Tất cả users có thể like)
```java
@Entity
@Table(name = "post_likes")
public class PostLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Cả INTERNAL và EXTERNAL đều like được
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

---

## 2. Enum Definitions

### 2.1 PostStatus
```java
public enum PostStatus {
    DRAFT,      // Bản nháp - chỉ tác giả xem được
    PUBLISHED,  // Đã xuất bản - tất cả user xem được
    ARCHIVED    // Đã lưu trữ - chỉ admin xem được
}
```

### 2.2 PostCategory
```java
public enum PostCategory {
    ANNOUNCEMENT,  // Thông báo
    NEWS,          // Tin tức
    POLICY,        // Chính sách
    GUIDE          // Hướng dẫn
}
```

---

## 3. DTO Structure

### 3.1 CreatePostDTO
```java
public class CreatePostDTO {
    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    @NotNull(message = "Category is required")
    private PostCategory category;
    
    private PostStatus status; // Default: DRAFT
}
```

### 3.2 UpdatePostDTO
```java
public class UpdatePostDTO {
    @Size(max = 200)
    private String title;
    
    private String content;
    
    private PostCategory category;
    
    private PostStatus status;
}
```

### 3.3 PostResponseDTO
```java
public class PostResponseDTO {
    private Long id;
    private String title;
    private String content;
    private PostStatus status;
    private PostCategory category;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    
    // Author info
    private Long authorId;
    private String authorName;
    private String authorEmail;
    
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### 3.4 CommentDTO
```java
public class CommentDTO {
    @NotBlank(message = "Comment content is required")
    @Size(max = 1000)
    private String content;
}
```

---

## 4. Repository Layer

### 4.1 PostRepository
```java
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // Lấy tất cả bài PUBLISHED (cho mọi user)
    List<Post> findByStatusOrderByPublishedAtDesc(PostStatus status);
    
    // Lấy bài của 1 tác giả cụ thể (cho chính họ quản lý)
    List<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
    
    // Tìm theo category
    List<Post> findByStatusAndCategoryOrderByPublishedAtDesc(
        PostStatus status, 
        PostCategory category
    );
    
    // Tìm kiếm theo title
    List<Post> findByStatusAndTitleContainingIgnoreCaseOrderByPublishedAtDesc(
        PostStatus status, 
        String keyword
    );
}
```

### 4.2 PostCommentRepository
```java
@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    
    List<PostComment> findByPostIdOrderByCreatedAtDesc(Long postId);
    
    Long countByPostId(Long postId);
}
```

### 4.3 PostLikeRepository
```java
@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    
    Long countByPostId(Long postId);
    
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    
    Optional<PostLike> findByPostIdAndUserId(Long postId, Long userId);
}
```

---

## 5. Service Layer

### 5.1 PostService - Core Business Logic
```java
@Service
public class PostService {
    
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostCommentRepository commentRepository;
    private final PostLikeRepository likeRepository;
    
    /**
     * TẠO BÀI MỚI - CHỈ INTERNAL GROUP
     * Kiểm tra user phải thuộc INTERNAL role group
     */
    public PostResponseDTO createPost(CreatePostDTO dto, Long userId) {
        User author = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        // KIỂM TRA: Chỉ INTERNAL group mới được tạo bài
        boolean isInternal = author.getRoles().stream()
            .anyMatch(role -> role.getRoleGroup() == RoleGroup.INTERNAL);
        
        if (!isInternal) {
            throw new UnauthorizedException("Only internal staff can create posts");
        }
        
        Post post = Post.builder()
            .title(dto.getTitle())
            .content(dto.getContent())
            .category(dto.getCategory())
            .status(dto.getStatus() != null ? dto.getStatus() : PostStatus.DRAFT)
            .author(author)
            .build();
        
        if (post.getStatus() == PostStatus.PUBLISHED) {
            post.setPublishedAt(LocalDateTime.now());
        }
        
        Post saved = postRepository.save(post);
        return mapToResponseDTO(saved);
    }
    
    /**
     * CẬP NHẬT BÀI - CHỈ TÁC GIẢ HOẶC ADMIN
     */
    public PostResponseDTO updatePost(Long postId, UpdatePostDTO dto, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new PostNotFoundException("Post not found"));
        
        User currentUser = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        // Kiểm tra quyền: Phải là tác giả hoặc có role ADMIN
        boolean isAuthor = post.getAuthor().getId().equals(userId);
        boolean isAdmin = currentUser.getRoles().stream()
            .anyMatch(role -> "ADMIN".equals(role.getName()));
        
        if (!isAuthor && !isAdmin) {
            throw new UnauthorizedException("You don't have permission to edit this post");
        }
        
        // Cập nhật các trường
        if (dto.getTitle() != null) post.setTitle(dto.getTitle());
        if (dto.getContent() != null) post.setContent(dto.getContent());
        if (dto.getCategory() != null) post.setCategory(dto.getCategory());
        
        if (dto.getStatus() != null) {
            PostStatus oldStatus = post.getStatus();
            post.setStatus(dto.getStatus());
            
            // Nếu chuyển từ DRAFT -> PUBLISHED
            if (oldStatus != PostStatus.PUBLISHED && dto.getStatus() == PostStatus.PUBLISHED) {
                post.setPublishedAt(LocalDateTime.now());
            }
        }
        
        post.setUpdatedAt(LocalDateTime.now());
        Post updated = postRepository.save(post);
        return mapToResponseDTO(updated);
    }
    
    /**
     * XÓA BÀI - CHỈ TÁC GIẢ HOẶC ADMIN
     */
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new PostNotFoundException("Post not found"));
        
        User currentUser = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        boolean isAuthor = post.getAuthor().getId().equals(userId);
        boolean isAdmin = currentUser.getRoles().stream()
            .anyMatch(role -> "ADMIN".equals(role.getName()));
        
        if (!isAuthor && !isAdmin) {
            throw new UnauthorizedException("You don't have permission to delete this post");
        }
        
        postRepository.delete(post);
    }
    
    /**
     * XEM DANH SÁCH BÀI PUBLISHED - TẤT CẢ USER
     */
    public List<PostResponseDTO> getAllPublishedPosts() {
        return postRepository.findByStatusOrderByPublishedAtDesc(PostStatus.PUBLISHED)
            .stream()
            .map(this::mapToResponseDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * XEM CHI TIẾT BÀI - TẤT CẢ USER (nếu PUBLISHED)
     */
    public PostResponseDTO getPostById(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new PostNotFoundException("Post not found"));
        
        // Nếu bài DRAFT, chỉ tác giả hoặc admin xem được
        if (post.getStatus() == PostStatus.DRAFT) {
            User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
            
            boolean isAuthor = post.getAuthor().getId().equals(userId);
            boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(role -> "ADMIN".equals(role.getName()));
            
            if (!isAuthor && !isAdmin) {
                throw new UnauthorizedException("This post is not published yet");
            }
        }
        
        // Tăng view count
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);
        
        return mapToResponseDTO(post);
    }
    
    /**
     * COMMENT - TẤT CẢ USER
     */
    public void addComment(Long postId, CommentDTO dto, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new PostNotFoundException("Post not found"));
        
        if (post.getStatus() != PostStatus.PUBLISHED) {
            throw new UnauthorizedException("Cannot comment on unpublished post");
        }
        
        User commenter = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        PostComment comment = PostComment.builder()
            .post(post)
            .commenter(commenter)
            .content(dto.getContent())
            .build();
        
        commentRepository.save(comment);
    }
    
    /**
     * LIKE/UNLIKE - TẤT CẢ USER
     */
    public void toggleLike(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new PostNotFoundException("Post not found"));
        
        if (post.getStatus() != PostStatus.PUBLISHED) {
            throw new UnauthorizedException("Cannot like unpublished post");
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        Optional<PostLike> existingLike = likeRepository.findByPostIdAndUserId(postId, userId);
        
        if (existingLike.isPresent()) {
            // Unlike
            likeRepository.delete(existingLike.get());
        } else {
            // Like
            PostLike like = PostLike.builder()
                .post(post)
                .user(user)
                .build();
            likeRepository.save(like);
        }
    }
    
    private PostResponseDTO mapToResponseDTO(Post post) {
        return PostResponseDTO.builder()
            .id(post.getId())
            .title(post.getTitle())
            .content(post.getContent())
            .status(post.getStatus())
            .category(post.getCategory())
            .viewCount(post.getViewCount())
            .likeCount(likeRepository.countByPostId(post.getId()).intValue())
            .commentCount(commentRepository.countByPostId(post.getId()).intValue())
            .authorId(post.getAuthor().getId())
            .authorName(post.getAuthor().getFullName())
            .authorEmail(post.getAuthor().getEmail())
            .publishedAt(post.getPublishedAt())
            .createdAt(post.getCreatedAt())
            .updatedAt(post.getUpdatedAt())
            .build();
    }
}
```

---

## 6. Controller Layer

### 6.1 PostController
```java
@RestController
@RequestMapping("/api/posts")
public class PostController {
    
    private final PostService postService;
    
    /**
     * TẠO BÀI - CHỈ INTERNAL GROUP
     * Endpoint: POST /api/posts
     * Authorization: INTERNAL roles only
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PostResponseDTO>> createPost(
            @Valid @RequestBody CreatePostDTO dto,
            Authentication authentication) {
        
        Long userId = getCurrentUserId(authentication);
        PostResponseDTO result = postService.createPost(dto, userId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Post created successfully", result)
        );
    }
    
    /**
     * CẬP NHẬT BÀI - CHỈ TÁC GIẢ HOẶC ADMIN
     * Endpoint: PUT /api/posts/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PostResponseDTO>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePostDTO dto,
            Authentication authentication) {
        
        Long userId = getCurrentUserId(authentication);
        PostResponseDTO result = postService.updatePost(id, dto, userId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Post updated successfully", result)
        );
    }
    
    /**
     * XÓA BÀI - CHỈ TÁC GIẢ HOẶC ADMIN
     * Endpoint: DELETE /api/posts/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long userId = getCurrentUserId(authentication);
        postService.deletePost(id, userId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Post deleted successfully", null)
        );
    }
    
    /**
     * XEM DANH SÁCH BÀI PUBLISHED - TẤT CẢ USER
     * Endpoint: GET /api/posts
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PostResponseDTO>>> getAllPosts() {
        List<PostResponseDTO> posts = postService.getAllPublishedPosts();
        
        return ResponseEntity.ok(
            ApiResponse.success("Posts retrieved successfully", posts)
        );
    }
    
    /**
     * XEM CHI TIẾT BÀI - TẤT CẢ USER (PUBLISHED)
     * Endpoint: GET /api/posts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponseDTO>> getPostById(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long userId = authentication != null ? getCurrentUserId(authentication) : null;
        PostResponseDTO post = postService.getPostById(id, userId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Post retrieved successfully", post)
        );
    }
    
    /**
     * COMMENT BÀI - TẤT CẢ USER
     * Endpoint: POST /api/posts/{id}/comments
     */
    @PostMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentDTO dto,
            Authentication authentication) {
        
        Long userId = getCurrentUserId(authentication);
        postService.addComment(id, dto, userId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Comment added successfully", null)
        );
    }
    
    /**
     * LIKE/UNLIKE BÀI - TẤT CẢ USER
     * Endpoint: POST /api/posts/{id}/like
     */
    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> toggleLike(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long userId = getCurrentUserId(authentication);
        postService.toggleLike(id, userId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Like toggled successfully", null)
        );
    }
    
    private Long getCurrentUserId(Authentication authentication) {
        // Extract user ID from authentication principal
        // Implementation depends on your UserDetails setup
        return ((UserPrincipal) authentication.getPrincipal()).getId();
    }
}
```

---

## 7. Security Configuration

### 7.1 SecurityConfig - Endpoint Authorization
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // Public endpoints - xem bài published
                .requestMatchers(HttpMethod.GET, "/api/posts", "/api/posts/**")
                    .permitAll()
                
                // Create post - chỉ INTERNAL group
                .requestMatchers(HttpMethod.POST, "/api/posts")
                    .hasAnyRole("EMPLOYEE", "MANAGER", "ADMIN")
                
                // Update/Delete post - chỉ INTERNAL group (logic check ở service)
                .requestMatchers(HttpMethod.PUT, "/api/posts/**")
                    .hasAnyRole("EMPLOYEE", "MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/posts/**")
                    .hasAnyRole("EMPLOYEE", "MANAGER", "ADMIN")
                
                // Comment và Like - tất cả authenticated users
                .requestMatchers("/api/posts/*/comments", "/api/posts/*/like")
                    .authenticated()
                
                .anyRequest().authenticated()
            );
        
        return http.build();
    }
}
```

---

## 8. Exception Handling

### 8.1 Custom Exceptions
```java
public class PostNotFoundException extends RuntimeException {
    public PostNotFoundException(String message) {
        super(message);
    }
}

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
```

### 8.2 Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(PostNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handlePostNotFound(PostNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(ex.getMessage(), null));
    }
    
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.error(ex.getMessage(), null));
    }
}
```

---

## 9. Database Schema

### 9.1 SQL Scripts
```sql
-- Posts table
CREATE TABLE posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    view_count INT DEFAULT 0,
    published_at DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_author (author_id),
    INDEX idx_published_at (published_at)
);

-- Post Comments table
CREATE TABLE post_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_post (post_id),
    INDEX idx_user (user_id)
);

-- Post Likes table
CREATE TABLE post_likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_user (post_id, user_id),
    INDEX idx_post (post_id),
    INDEX idx_user (user_id)
);
```

---

## 10. Use Cases & Examples

### 10.1 Use Case: Employee tạo thông báo mới

**Request:**
```http
POST /api/posts
Authorization: Bearer <employee_token>
Content-Type: application/json

{
    "title": "Thông báo nghỉ lễ 30/4 - 1/5",
    "content": "Công ty thông báo lịch nghỉ lễ...",
    "category": "ANNOUNCEMENT",
    "status": "PUBLISHED"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Post created successfully",
    "data": {
        "id": 1,
        "title": "Thông báo nghỉ lễ 30/4 - 1/5",
        "status": "PUBLISHED",
        "authorName": "Nguyễn Văn A",
        "publishedAt": "2025-12-04T16:30:00"
    }
}
```

### 10.2 Use Case: Customer cố tạo bài (BỊ TỪ CHỐI)

**Request:**
```http
POST /api/posts
Authorization: Bearer <customer_token>
Content-Type: application/json

{
    "title": "Góp ý dịch vụ",
    "content": "Tôi muốn đề xuất...",
    "category": "ANNOUNCEMENT"
}
```

**Response:**
```json
{
    "success": false,
    "message": "Only internal staff can create posts",
    "data": null
}
```

### 10.3 Use Case: Customer xem và comment bài

**1. Xem danh sách:**
```http
GET /api/posts
```

**2. Xem chi tiết:**
```http
GET /api/posts/1
```

**3. Comment:**
```http
POST /api/posts/1/comments
Authorization: Bearer <customer_token>

{
    "content": "Cảm ơn công ty đã thông báo!"
}
```

**4. Like:**
```http
POST /api/posts/1/like
Authorization: Bearer <customer_token>
```

---

## 11. Quy Tắc Phân Quyền Tổng Kết

| Hành Động | Internal Group | External Group |
|-----------|----------------|----------------|
| Tạo bài mới | ✅ Được phép | ❌ Từ chối |
| Sửa bài của mình | ✅ Được phép | ❌ Không áp dụng |
| Sửa bài người khác | ✅ Chỉ ADMIN | ❌ Không áp dụng |
| Xóa bài của mình | ✅ Được phép | ❌ Không áp dụng |
| Xóa bài người khác | ✅ Chỉ ADMIN | ❌ Không áp dụng |
| Xem bài PUBLISHED | ✅ Được phép | ✅ Được phép |
| Xem bài DRAFT | ✅ Chỉ tác giả/ADMIN | ❌ Từ chối |
| Comment bài | ✅ Được phép | ✅ Được phép |
| Like bài | ✅ Được phép | ✅ Được phép |

---

## 12. Testing Checklist

### 12.1 Authorization Tests
- [ ] EMPLOYEE tạo bài thành công
- [ ] MANAGER tạo bài thành công
- [ ] ADMIN tạo bài thành công
- [ ] CUSTOMER tạo bài bị từ chối (403 Forbidden)
- [ ] Chỉ tác giả sửa/xóa bài của mình
- [ ] ADMIN sửa/xóa bài bất kỳ
- [ ] CUSTOMER không sửa/xóa được bài nào

### 12.2 Functional Tests
- [ ] Tạo bài DRAFT không có publishedAt
- [ ] Chuyển DRAFT → PUBLISHED set publishedAt
- [ ] View count tăng khi xem bài
- [ ] Like/Unlike toggle đúng
- [ ] Comment lưu với đúng user
- [ ] Lấy bài theo category
- [ ] Tìm kiếm bài theo title

---

## 13. API Endpoints Summary

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| POST | `/api/posts` | INTERNAL only | Tạo bài mới |
| GET | `/api/posts` | Public | Xem danh sách PUBLISHED |
| GET | `/api/posts/{id}` | Public/Conditional | Xem chi tiết bài |
| PUT | `/api/posts/{id}` | Author/ADMIN | Cập nhật bài |
| DELETE | `/api/posts/{id}` | Author/ADMIN | Xóa bài |
| POST | `/api/posts/{id}/comments` | Authenticated | Comment bài |
| POST | `/api/posts/{id}/like` | Authenticated | Like/Unlike bài |
| GET | `/api/posts/{id}/comments` | Public | Xem comments |

---

## 14. Implementation Order

1. **Phase 1: Entities & Enums**
   - Tạo Post, PostComment, PostLike entities
   - Tạo PostStatus, PostCategory enums

2. **Phase 2: Repositories**
   - PostRepository với các query methods
   - PostCommentRepository
   - PostLikeRepository

3. **Phase 3: DTOs**
   - CreatePostDTO, UpdatePostDTO
   - PostResponseDTO
   - CommentDTO

4. **Phase 4: Service Layer**
   - PostService với logic phân quyền
   - Validation cho INTERNAL group

5. **Phase 5: Controller**
   - PostController với @PreAuthorize
   - Exception handling

6. **Phase 6: Security Config**
   - Cập nhật SecurityConfig
   - Method-level security

7. **Phase 7: Testing**
   - Unit tests cho service
   - Integration tests cho endpoints
   - Security tests

---

## 15. Notes & Best Practices

### 15.1 Security Notes
- ✅ Luôn kiểm tra RoleGroup ở service layer (defense in depth)
- ✅ Dùng @PreAuthorize ở controller để chặn sớm
- ✅ Validate ownership trước khi sửa/xóa
- ✅ DRAFT posts chỉ tác giả/ADMIN xem được

### 15.2 Performance Notes
- ✅ Index trên status, category, published_at
- ✅ Lazy loading cho author relationship
- ✅ Pagination cho danh sách bài (TODO)
- ✅ Cache cho bài popular (TODO)

### 15.3 Business Rules
- Chỉ INTERNAL group tạo bài
- EXTERNAL group chỉ đọc, comment, like
- DRAFT không public cho external
- ADMIN có full control
- Tác giả quản lý bài của mình

package com.example.seatrans.features.post.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Post responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private Long authorId;
    private String authorName;
    private List<CategoryResponse> categories;
    private String thumbnailUrl;
    private String thumbnailPublicId;
    private LocalDateTime publishedAt;
    private Boolean isPublished;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

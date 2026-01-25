package com.example.seatrans.features.post.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Post creation and update requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostRequest {
    
    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title must not exceed 500 characters")
    private String title;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    private List<Long> categoryIds;
    
    private String thumbnailUrl;
    private String thumbnailPublicId;
    
    private Boolean isPublished;
}

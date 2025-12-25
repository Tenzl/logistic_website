package com.example.seatrans.features.post.model;

import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;

import com.example.seatrans.features.user.model.User;
import com.example.seatrans.shared.model.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Post Entity
 * Stores blog posts and news articles with rich text content
 */
@Entity
@Table(name = "posts", indexes = {
        @Index(name = "idx_published", columnList = "is_published, published_at"),
        @Index(name = "idx_author", columnList = "author_id")
})
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post extends BaseEntity {

    @Column(nullable = false, length = 500)
    private String title;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String summary;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = false;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<PostImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<PostCategory> postCategories = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (isPublished == null) {
            isPublished = false;
        }
        if (viewCount == null) {
            viewCount = 0;
        }
    }

    /**
     * Publish the post
     */
    public void publish() {
        this.isPublished = true;
        this.publishedAt = LocalDateTime.now();
    }

    /**
     * Unpublish the post
     */
    public void unpublish() {
        this.isPublished = false;
        this.publishedAt = null;
    }

    /**
     * Increment view count
     */
    public void incrementViewCount() {
        this.viewCount++;
    }
}

package com.example.seatrans.features.post.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.post.model.Post;

/**
 * Repository for Post entity
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    /**
     * Find all published posts ordered by published date
     */
    List<Post> findByIsPublishedTrueOrderByPublishedAtDesc();
    
    /**
     * Find published posts with pagination
     */
    Page<Post> findByIsPublishedTrue(Pageable pageable);
    
    /**
     * Find posts by category name
     */
    @Query("SELECT DISTINCT p FROM Post p JOIN p.postCategories pc JOIN pc.category c WHERE c.name = :categoryName ORDER BY p.createdAt DESC")
    List<Post> findByCategoryOrderByCreatedAtDesc(@Param("categoryName") String categoryName);
    
    /**
     * Find published posts by category name
     */
    @Query("SELECT DISTINCT p FROM Post p JOIN p.postCategories pc JOIN pc.category c WHERE p.isPublished = true AND c.name = :categoryName ORDER BY p.publishedAt DESC")
    List<Post> findByIsPublishedTrueAndCategoryOrderByPublishedAtDesc(@Param("categoryName") String categoryName);
    
    /**
     * Find posts by author
     */
    List<Post> findByAuthorOrderByCreatedAtDesc(User author);
    
    /**
     * Search posts by title only (content is CLOB, cannot use LOWER)
     */
    @Query("SELECT p FROM Post p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Post> searchByKeyword(@Param("keyword") String keyword);
    
    /**
     * Search published posts by title only
     */
    @Query("SELECT p FROM Post p WHERE p.isPublished = true AND " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Post> searchPublishedByKeyword(@Param("keyword") String keyword);
    
    /**
     * Count published posts
     */
    long countByIsPublishedTrue();
    
    /**
     * Count posts by category name
     */
    @Query("SELECT COUNT(DISTINCT p) FROM Post p JOIN p.postCategories pc JOIN pc.category c WHERE c.name = :categoryName")
    long countByCategory(@Param("categoryName") String categoryName);
    
    /**
     * Find latest posts
     */
    @Query("SELECT p FROM Post p WHERE p.isPublished = true " +
           "ORDER BY p.publishedAt DESC")
    List<Post> findLatestPublished(Pageable pageable);
    
    /**
     * Atomically increment view count (thread-safe, prevents race conditions)
     */
    @Modifying
    @Query("UPDATE Post p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    int incrementViewCount(@Param("id") Long id);
}


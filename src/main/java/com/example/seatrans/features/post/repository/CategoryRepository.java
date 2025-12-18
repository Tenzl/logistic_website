package com.example.seatrans.features.post.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.post.model.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Optional<Category> findByName(String name);
    Optional<Category> findBySlug(String slug);
    
    boolean existsByName(String name);
    boolean existsBySlug(String slug);

    long countByPostCategoriesCategoryId(Long categoryId);
}

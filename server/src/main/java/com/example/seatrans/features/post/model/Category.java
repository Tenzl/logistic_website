package com.example.seatrans.features.post.model;

import java.util.ArrayList;
import java.util.List;

import com.example.seatrans.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Category Entity
 * Stores news/post categories
 */
@Entity
@Table(name = "categories")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String slug;

    @Column(length = 500)
    private String description;

    @OneToMany(mappedBy = "category")
    @ToString.Exclude
    @Builder.Default
    private List<PostCategory> postCategories = new ArrayList<>();
}

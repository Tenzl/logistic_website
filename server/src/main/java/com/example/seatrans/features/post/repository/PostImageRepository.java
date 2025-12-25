package com.example.seatrans.features.post.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.seatrans.features.post.model.PostImage;

@Repository
public interface PostImageRepository extends JpaRepository<PostImage, Long> {
}

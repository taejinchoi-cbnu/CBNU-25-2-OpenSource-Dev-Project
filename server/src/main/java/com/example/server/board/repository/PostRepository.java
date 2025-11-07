package com.example.server.board.repository;

import com.example.server.board.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Query(
            value = "select distinct p from Post p join fetch p.author a",
            countQuery = "select count(p) from Post p"
    )
    Page<Post> findAllWithAuthor(Pageable pageable);
}
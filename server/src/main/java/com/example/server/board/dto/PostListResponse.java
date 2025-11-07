package com.example.server.board.dto;

import com.example.server.board.entity.Post;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
public class PostListResponse {
    private Long id;
    private String title;
    private UUID authorId;
    private Integer viewCount;
    private OffsetDateTime createdAt;

    public PostListResponse(Post post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.authorId = post.getAuthor().getId();
        this.viewCount = post.getViewCount();
        this.createdAt = post.getCreatedAt();
    }
}

package com.example.server.board.dto;

import com.example.server.board.entity.Post;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private UUID authorId;
    private Integer viewCount;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public PostResponse(Post post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.authorId = post.getAuthorId();
        this.viewCount = post.getViewCount();
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
    }
}

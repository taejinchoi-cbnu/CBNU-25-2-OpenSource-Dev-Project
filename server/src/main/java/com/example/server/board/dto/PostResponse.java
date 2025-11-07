package com.example.server.board.dto;

import com.example.server.board.entity.Post;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private UUID authorId;
    private String authorNickname;
    private Integer viewCount;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<CommentResponse> comments;

    public PostResponse(Post post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();

        if (post.getAuthor() != null) {
            this.authorId = post.getAuthor().getId();
            this.authorNickname = post.getAuthor().getNickname();
        }

        this.viewCount = post.getViewCount();
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
    }
}

package com.example.server.board.dto;

import com.example.server.board.entity.Comment;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
public class CommentResponse {
    private Long id;
    private String content;
    private UUID authorId;
    private String authorNickname;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public CommentResponse(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.authorId = comment.getAuthor().getId();
        this.authorNickname = comment.getAuthor().getNickname();
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();
    }
}

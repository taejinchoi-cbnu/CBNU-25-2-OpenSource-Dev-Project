package com.example.server.user.dto;

import com.example.server.board.entity.Comment;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class CommentSummary {
    private Long postId;
    private String content;
    private String postTitle;
    private OffsetDateTime createdAt;

    public static CommentSummary from(Comment comment) {
        return CommentSummary.builder()
                .postId(comment.getPost().getId())
                .content(comment.getContent())
                .postTitle(comment.getPost().getTitle())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}

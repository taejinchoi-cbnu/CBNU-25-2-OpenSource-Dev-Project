package com.example.server.user.dto;

import com.example.server.board.entity.Post;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class PostSummary {
    private Long id;
    private String title;
    private OffsetDateTime createdAt;

    public static PostSummary from(Post post) {
        return PostSummary.builder()
                .id(post.getId())
                .title(post.getTitle())
                .createdAt(post.getCreatedAt())
                .build();

    }
}

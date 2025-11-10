package com.example.server.user.dto;

import com.example.server.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class ProfileResponse {

    private String email;
    private String nickname;
    private List<PostSummary> posts;
    private List<CommentSummary> comments;

    public static ProfileResponse from(User user) {
        List<PostSummary> postSummaries = user.getPosts().stream()
                .map(PostSummary::from)
                .collect(Collectors.toList());

        List<CommentSummary> commentSummaries = user.getComments().stream()
                .map(CommentSummary::from)
                .collect(Collectors.toList());

        return ProfileResponse.builder()
                .email(user.getEmail())
                .nickname(user.getNickname())
                .posts(postSummaries)
                .comments(commentSummaries)
                .build();
    }
}

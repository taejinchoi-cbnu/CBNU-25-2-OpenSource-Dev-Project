package com.example.server.user.dto;

import com.example.server.auth.entity.AuthUser;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder // @Setter 대신 @Builder 사용
public class ProfileResponse {

    private String email;
    private String nickname; // 'nickName' -> 'nickname'으로 수정
    private List<PostSummary> posts;
    private List<CommentSummary> comments;

    // 메소드 내용 전체 구현
    public static ProfileResponse from(AuthUser user) {
        List<PostSummary> postSummaries = user.getPosts().stream()
                .map(PostSummary::from)
                .collect(Collectors.toList());

        List<CommentSummary> commentSummaries = user.getComments().stream()
                .map(CommentSummary::from)
                .collect(Collectors.toList());

        return ProfileResponse.builder()
                .email(user.getRawUserMetaData().get("email").asText())
                .nickname(user.getNickname())
                .posts(postSummaries)
                .comments(commentSummaries)
                .build();
    }
}

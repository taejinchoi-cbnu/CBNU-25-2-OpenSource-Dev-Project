package com.example.server.board.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentCreateRequest {
    @NotBlank(message = "댓글 내용은 필수 입력 항목입니다.")
    private String content;
}

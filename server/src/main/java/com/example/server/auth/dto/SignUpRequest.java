package com.example.server.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignUpRequest {

    @NotBlank(message = "이메일 빈칸이면 안됨")
    @Email(message = "이메일 형식이 아님")
    private String email;

    @NotBlank(message = "비번 빈칸이면 안됨")
    @Size(min = 4, message = "비밀번호는 최소 4자리")
    private String password;

    @NotBlank(message = "닉네임 빈칸이면 안됨")
    private String nickname;
}

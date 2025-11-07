package com.mysite.server.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "이메일 빈칸이면 안됨")
    @Email(message = "이메일 형식이 아님")
    private String email;

    @NotBlank(message = "비밀번호 빈칸이면 안됨")
    private String password;
}

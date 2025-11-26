package com.example.server.auth.controller;

import com.example.server.auth.dto.AuthResponse;
import com.example.server.auth.dto.LoginRequest;
import com.example.server.auth.dto.LoginResponse;
import com.example.server.auth.dto.SignUpRequest;
import com.example.server.auth.dto.SupabaseUser;
import com.example.server.auth.service.AuthService;
import com.example.server.config.SupabaseProperties;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth Controller", description = "로그인, 회원가입, 로그아웃, 토큰 갱신 처리 컨트롤러")
public class AuthController {

    private final AuthService authService; // 인증 관련 비즈니스 로직을 처리

    private final SupabaseProperties supabaseProperties; // 환경설정에서 가져온 Superbase 관련 설정값

    @PostMapping("/signup") // 화원가입 API
    public ResponseEntity<SupabaseUser> signup(@Valid @RequestBody SignUpRequest signUpRequest) {
        AuthResponse authResponse = authService.signUp(signUpRequest); // 사용자 정보를 받아 Superbase Auth를 통해 회원가입
        return ResponseEntity.ok(authResponse.getUser()); // 성공 시 유저 정보 반환
    } // sign up 권한 mapping

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        // 로그인 처리: access token, refresh token, user 정보 획득
        AuthResponse authResponse = authService.login(loginRequest); // 로그인 API

        ResponseCookie cookie = createRefreshTokenCookie(
                authResponse.getRefreshToken(),
                authResponse.getExpiresIn()
        ); // AcessToken, RefreshToken 발급

        // 클라이언트로 전달할 DTO (accessToken + user 정보)
        LoginResponse loginResponse = new LoginResponse(
                authResponse.getAccessToken(),
                authResponse.getUser()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString()) // 쿠키 설정
                .body(loginResponse);
    } // login mapping


    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh( // 토큰 재발급 API
            @CookieValue(name = "refreshToken", required = false) String refreshToken
    ) {
        // refreshToken이 쿠키에 존재하지 않으면 재발급 불가능 → Unauthorized
        if (refreshToken == null) {
            return ResponseEntity.status(401).build();
        }

        // refreshToken을 사용하여 새로운 accessToken + refreshToken 발급
        AuthResponse authResponse = authService.refresh(refreshToken);

        // 새 refreshToken을 다시 쿠키에 저장
        ResponseCookie cookie = createRefreshTokenCookie(
                authResponse.getRefreshToken(),
                authResponse.getExpiresIn()
        );

        // 클라이언트에 보낼 내용
        LoginResponse loginResponse = new LoginResponse(
                authResponse.getAccessToken(),
                authResponse.getUser()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(loginResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() { // logout API
        // refreshToken 쿠키 삭제 (maxAge=0)
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .path("/api/auth")
                .maxAge(0) // 즉시 만료
                .secure(supabaseProperties.isCookieSecure()) // HTTPS 환경에서만 쿠키 전송 여부
                .sameSite("Strict") // CSRF 방지
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    } // logout mapping

    private ResponseCookie createRefreshTokenCookie(String refreshToken, long maxAgeInSeconds) {
        // Refresh Token을 httpOnly 쿠키로 생성하는 유틸함수
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true) // JS에서 접근 불가
                .path("/api/auth")
                .maxAge(Duration.ofSeconds(maxAgeInSeconds)) // refresh token 만료시간 설정
                .secure(supabaseProperties.isCookieSecure()) // HTTPS에서만 사용
                .sameSite("Strict") // CSRF 공격 방어 강화
                .build();
    }
}

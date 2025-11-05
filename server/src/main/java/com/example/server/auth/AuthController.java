package com.mysite.server.auth;

import com.mysite.server.auth.dto.LoginRequest;
import com.mysite.server.auth.dto.LoginResponse;
import com.mysite.server.auth.dto.SignUpRequest;
import com.mysite.server.auth.dto.SupabaseUser;
import com.mysite.server.auth.service.AuthService;
import com.mysite.server.config.SupabaseProperties;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth Controller", description = "로그인, 회원가입, 로그아웃, 토큰 갱신 처리 컨트롤러")
public class AuthController {

    private final AuthService authService;
    private final SupabaseProperties supabaseProperties;

    @PostMapping("/signup")
    public Mono<ResponseEntity<SupabaseUser>> signup(@Valid @RequestBody SignUpRequest signUpRequest) {
        return authService.signUp(signUpRequest)
                .map(authResponse -> {
                    return ResponseEntity.ok()
                            .body(authResponse.getUser());
                });
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        return authService.login(loginRequest)
                .map(authResponse -> {
                    ResponseCookie cookie = createRefreshTokenCookie(authResponse.getRefreshToken(), authResponse.getExpiresIn());
                    LoginResponse loginResponse = new LoginResponse(authResponse.getAccessToken(), authResponse.getUser());
                    return ResponseEntity.ok()
                            .header(HttpHeaders.SET_COOKIE, cookie.toString())
                            .body(loginResponse);
                });
    }

    @PostMapping("/refresh")
    public Mono<ResponseEntity<LoginResponse>> refresh(@CookieValue("refreshToken") String refreshToken) {
        return authService.refresh(refreshToken)
                .map(authResponse -> {
                    ResponseCookie cookie = createRefreshTokenCookie(authResponse.getRefreshToken(), authResponse.getExpiresIn());
                    LoginResponse loginResponse = new LoginResponse(authResponse.getAccessToken(), authResponse.getUser());
                    return ResponseEntity.ok()
                            .header(HttpHeaders.SET_COOKIE, cookie.toString())
                            .body(loginResponse);
                });
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .path("/api/auth")
                .maxAge(0)
                .secure(supabaseProperties.isCookieSecure())
                .sameSite("Strict")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    private ResponseCookie createRefreshTokenCookie(String refreshToken, long maxAgeInSeconds) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .path("/api/auth")
                .maxAge(Duration.ofSeconds(maxAgeInSeconds))
                .secure(supabaseProperties.isCookieSecure())
                .sameSite("Strict")
                .build();
    }
}

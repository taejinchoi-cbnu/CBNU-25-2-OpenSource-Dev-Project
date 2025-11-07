package com.example.server.auth;

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

    private final AuthService authService;
    private final SupabaseProperties supabaseProperties;

    @PostMapping("/signup")
    public ResponseEntity<SupabaseUser> signup(@Valid @RequestBody SignUpRequest signUpRequest) {
        AuthResponse authResponse = authService.signUp(signUpRequest);
        return ResponseEntity.ok(authResponse.getUser());
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = authService.login(loginRequest);
        ResponseCookie cookie = createRefreshTokenCookie(authResponse.getRefreshToken(), authResponse.getExpiresIn());
        LoginResponse loginResponse = new LoginResponse(authResponse.getAccessToken(), authResponse.getUser());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(loginResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null) {
            return ResponseEntity.status(401).build();
        }
        AuthResponse authResponse = authService.refresh(refreshToken);
        ResponseCookie cookie = createRefreshTokenCookie(authResponse.getRefreshToken(), authResponse.getExpiresIn());
        LoginResponse loginResponse = new LoginResponse(authResponse.getAccessToken(), authResponse.getUser());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(loginResponse);
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

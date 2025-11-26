package com.example.server.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "supabase")
public class SupabaseProperties {

    /**
     * Supabase 프로젝트 기본 URL
     * 예: https://xxxx.supabase.co
     * WebClient baseUrl 설정 시 사용됨
     */
    private String url;


    private String anonKey; // Supabase anon public key
    private String serviceRoleKey; // 클라이언트에 절대 노출되면 안되는 관리자권한 키

    /**
     * Supabase Auth JWT 검증을 위한 JWKS URL
     * - Supabase가 JWT 서명에 사용하는 public key 목록 제공 URL
     * - JWT Auth Filter에서 token 검증에 사용됨
     */
    private String jwksUrl;

    /**
     * refreshToken 쿠키의 secure 설정 여부
     * - true → HTTPS에서만 쿠키 전송
     * - false → HTTP에서도 쿠키 전송 가능 (로컬 개발용)
     *
     * application.yml에서:
     * supabase:
     *   cookie-secure: false
     * 이런 식으로 설정
     */
    private boolean cookieSecure;

    // 직접 getter를 다시 정의 (Lombok에도 있지만 명시적으로 노출하는 형태)
    public boolean isCookieSecure() {
        return cookieSecure;
    }
}

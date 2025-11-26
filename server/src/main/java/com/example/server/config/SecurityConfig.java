package com.example.server.config;

import com.example.server.global.jwt.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    // JWT 값을 검증하고 SecurityContextHolder에 인증 정보를 넣는 커스텀 필터
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CORS 설정 적용
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // CSRF 보호 비활성화
                // JWT 기반에서는 세션 쿠키를 사용하지 않기 때문에 CSRF를 끌 수 있음
                .csrf(AbstractHttpConfigurer::disable)

                // 세션을 사용하지 않도록 설정
                // → 매 요청마다 JWT로 인증하기 때문에 STATELESS 전략 필요
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // URL 별 접근 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 인증이 필요 없는 경로들
                        // 로그인/회원가입 + Swagger 문서
                        .requestMatchers(
                                "/api/auth/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll()

                        // 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                )

                // JWT 인증 필터 추가
                // UsernamePasswordAuthenticationFilter 전에 실행되도록 설정해야
                // 스프링 시큐리티의 기본 인증 처리보다 먼저 JWT 검증이 이루어짐
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용할 Origin (프론트 주소)
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000"
        ));

        // 허용할 HTTP Method
        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // 허용할 헤더 (Authorization 포함 전체 허용)
        configuration.setAllowedHeaders(List.of("*"));

        // 인증 정보 포함 요청 허용 (쿠키, Authorization 헤더 등)
        configuration.setAllowCredentials(true);

        // CORS 설정 적용 범위 지정
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}

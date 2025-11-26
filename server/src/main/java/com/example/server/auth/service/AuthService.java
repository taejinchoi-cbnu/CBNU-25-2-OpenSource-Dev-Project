package com.example.server.auth.service;

import com.example.server.auth.dto.AuthResponse;
import com.example.server.auth.dto.LoginRequest;
import com.example.server.auth.dto.SignUpRequest;
import com.example.server.auth.exception.SupabaseAuthException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final WebClient supabaseWebClient; // Superbase Auth 서버와 HTTP 통신을 담당하는 WebClient

    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 문자열을 파싱하기 위한 ObjectMapper

    // 회원가입 로직
    public AuthResponse signUp(SignUpRequest signUpRequest) {
        // Supabase로 보낼 요청 바디 구성
        Map<String, Object> body = new HashMap<>();
        body.put("email", signUpRequest.getEmail());
        body.put("password", signUpRequest.getPassword());
        // Supabase의 user metadata 영역에 저장될 커스텀 데이터 (nickname)
        body.put("data", Map.of("nickname", signUpRequest.getNickname()));
        // email, password, nickname을 담아서 보냄

        try {
            return supabaseWebClient.post()
                    .uri("/auth/v1/signup")   // 회원가입 엔드포인트
                    .bodyValue(body)          // JSON 바디로 전송
                    .retrieve()               // 응답을 받아 처리 시작
                    .bodyToMono(AuthResponse.class) // 응답 JSON → AuthResponse 매핑
                    .block();                 // 비동기 Mono를 동기식으로 블록하여 결과 반환
        } catch (WebClientResponseException ex) {
            // HTTP 에러 상태코드(4xx, 5xx)가 반환될 경우 예외 발생
            throw parseSupabaseError(ex);
        }
    }


    public AuthResponse login(LoginRequest loginRequest) {
        try {
            return supabaseWebClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/auth/v1/token")
                            .queryParam("grant_type", "password") // 패스워드 기반 로그인
                            .build())
                    .bodyValue(loginRequest)            // email, password
                    .retrieve()
                    .bodyToMono(AuthResponse.class)
                    .block();
        } catch (WebClientResponseException ex) {
            // Supabase에서 에러 응답이 온 경우 에러 메시지 파싱 후 커스텀 예외로 변환
            throw parseSupabaseError(ex);
        }
    }


    public AuthResponse refresh(String refreshToken) { // 토큰 갱신 로직
        try {
            return supabaseWebClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/auth/v1/token")
                            .queryParam("grant_type", "refresh_token")
                            .build())
                    .bodyValue(Map.of("refresh_token", refreshToken))
                    .retrieve()
                    .bodyToMono(AuthResponse.class)
                    .block();
        } catch (WebClientResponseException ex) {
            // Supabase에서 refresh 토큰이 만료되었거나 유효하지 않을 때도 이 예외가 발생
            throw parseSupabaseError(ex);
        }
    }

    private SupabaseAuthException parseSupabaseError(WebClientResponseException ex) { // Supabase에서 내려준 에러 응답 파싱
        String responseBody = ex.getResponseBodyAsString(); // 에러 응답 바디(JSON 문자열)
        String errorMessage = "An unknown error occurred";  // 기본 에러 메시지

        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);

            // Supabase에서 자주 사용하는 에러 필드들을 순서대로 체크
            if (jsonNode.has("error_description")) {
                errorMessage = jsonNode.get("error_description").asText();
            } else if (jsonNode.has("msg")) {
                errorMessage = jsonNode.get("msg").asText();
            } else if (jsonNode.has("message")) {
                errorMessage = jsonNode.get("message").asText();
            }
        } catch (IOException e) {
            // 에러 메시지 파싱에 실패하면 기본 메시지 그대로 사용
        }

        // 상태코드(ex.getStatusCode())와 함께 커스텀 예외로 래핑해서 던짐
        return new SupabaseAuthException(errorMessage, ex.getStatusCode());
    }
}

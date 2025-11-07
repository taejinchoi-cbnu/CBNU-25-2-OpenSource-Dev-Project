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

    private final WebClient supabaseWebClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuthResponse signUp(SignUpRequest signUpRequest) {
        Map<String, Object> body = new HashMap<>();
        body.put("email", signUpRequest.getEmail());
        body.put("password", signUpRequest.getPassword());
        body.put("data", Map.of("nickname", signUpRequest.getNickname()));

        try {
            return supabaseWebClient.post()
                    .uri("/auth/v1/signup")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(AuthResponse.class)
                    .block();
        } catch (WebClientResponseException ex) {
            throw parseSupabaseError(ex);
        }
    }

    public AuthResponse login(LoginRequest loginRequest) {
        try {
            return supabaseWebClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/auth/v1/token")
                            .queryParam("grant_type", "password")
                            .build())
                    .bodyValue(loginRequest)
                    .retrieve()
                    .bodyToMono(AuthResponse.class)
                    .block();
        } catch (WebClientResponseException ex) {
            throw parseSupabaseError(ex);
        }
    }

    public AuthResponse refresh(String refreshToken) {
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
            throw parseSupabaseError(ex);
        }
    }

    private SupabaseAuthException parseSupabaseError(WebClientResponseException ex) {
        String responseBody = ex.getResponseBodyAsString();
        String errorMessage = "An unknown error occurred";
        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            if (jsonNode.has("error_description")) {
                errorMessage = jsonNode.get("error_description").asText();
            } else if (jsonNode.has("msg")) {
                errorMessage = jsonNode.get("msg").asText();
            } else if (jsonNode.has("message")) {
                errorMessage = jsonNode.get("message").asText();
            }
        } catch (IOException e) {
            // 에러 메시지 파싱에 실패하면 기본 메시지 사용
        }
        return new SupabaseAuthException(errorMessage, ex.getStatusCode());
    }
}

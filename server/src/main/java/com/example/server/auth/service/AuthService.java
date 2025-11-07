package com.mysite.server.auth.service;

import com.mysite.server.auth.dto.AuthResponse;
import com.mysite.server.auth.dto.LoginRequest;
import com.mysite.server.auth.dto.SignUpRequest;
import com.mysite.server.auth.exception.SupabaseAuthException;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final WebClient supabaseWebClient;

    public Mono<AuthResponse> signUp(SignUpRequest signUpRequest) {
        Map<String, Object> body = new HashMap<>();
        body.put("email", signUpRequest.getEmail());
        body.put("password", signUpRequest.getPassword());
        body.put("data", Map.of("nickname", signUpRequest.getNickname()));

        return supabaseWebClient.post()
                .uri("/auth/v1/signup")
                .bodyValue(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::handleError)
                .bodyToMono(AuthResponse.class);
    }

    public Mono<AuthResponse> login(LoginRequest loginRequest) {
        return supabaseWebClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/auth/v1/token")
                        .queryParam("grant_type", "password")
                        .build())
                .bodyValue(loginRequest)
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::handleError)
                .bodyToMono(AuthResponse.class);
    }

    public Mono<AuthResponse> refresh(String refreshToken) {
        return supabaseWebClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/auth/v1/token")
                        .queryParam("grant_type", "refresh_token")
                        .build())
                .bodyValue(Map.of("refresh_token", refreshToken))
                .retrieve()
                .onStatus(HttpStatusCode::isError, this::handleError)
                .bodyToMono(AuthResponse.class);
    }

    private Mono<? extends Throwable> handleError(ClientResponse response) {
        return response.bodyToMono(JsonNode.class)
                .flatMap(jsonNode -> {
                    String errorMessage = jsonNode.has("error_description") ?
                            jsonNode.get("error_description").asText() :
                            (jsonNode.has("msg") ? jsonNode.get("msg").asText() : "An unknown error occurred");
                    return Mono.error(new SupabaseAuthException(errorMessage, response.statusCode()));
                });
    }
}

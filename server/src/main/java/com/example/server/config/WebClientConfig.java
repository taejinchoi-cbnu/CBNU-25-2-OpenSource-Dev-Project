package com.example.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    @Bean
    public WebClient supabaseWebClient(SupabaseProperties props) {
        WebClient.Builder builder = WebClient.builder()
                .baseUrl(props.getUrl());

        // 기본 header로 anon key 설정
        if (props.getAnonKey() != null && !props.getAnonKey().isBlank()) {
            builder.defaultHeader("apikey", props.getAnonKey());
        }

        return builder.build();
    }
}
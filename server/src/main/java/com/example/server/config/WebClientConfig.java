package com.example.server.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.codec.json.Jackson2JsonDecoder;
import org.springframework.http.codec.json.Jackson2JsonEncoder;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    private final ObjectMapper objectMapper;

    public WebClientConfig(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

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

    @Bean
    public WebClient geminiWebClient() {
        // UTF-8 인코딩을 위한 ExchangeStrategies 설정
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> {
                    // 이미지 처리를 위해 메모리 제한 증가 (16MB)
                    configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024);

                    // UTF-8 ObjectMapper를 사용하는 Jackson encoder/decoder 설정
                    configurer.defaultCodecs().jackson2JsonEncoder(
                            new Jackson2JsonEncoder(objectMapper, MediaType.APPLICATION_JSON)
                    );
                    configurer.defaultCodecs().jackson2JsonDecoder(
                            new Jackson2JsonDecoder(objectMapper, MediaType.APPLICATION_JSON)
                    );
                })
                .build();

        return WebClient.builder()
                .exchangeStrategies(strategies)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8")
                .defaultHeader(HttpHeaders.ACCEPT, "application/json; charset=UTF-8")
                .defaultHeader(HttpHeaders.ACCEPT_CHARSET, "UTF-8")
                .build();
    }
}
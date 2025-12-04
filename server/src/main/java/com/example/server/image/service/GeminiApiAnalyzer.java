package com.example.server.image.service;

import com.example.server.image.dto.AnalysisResultDto;
import com.example.server.image.dto.gemini.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.Base64;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
public class GeminiApiAnalyzer implements ImageAnalyzer {

    private final WebClient webClient;
    private final String geminiApiKey;
    private final String geminiApiPrompt;
    private final ObjectMapper objectMapper;

    public GeminiApiAnalyzer(@Qualifier("geminiWebClient") WebClient geminiWebClient,
                             @Value("${gemini.api.key}") String geminiApiKey,
                             @Value("${gemini.api.url}") String geminiApiUrl,
                             @Value("${gemini.api.prompt}") String geminiApiPrompt,
                             ObjectMapper objectMapper) {


        this.webClient = geminiWebClient.mutate().baseUrl(geminiApiUrl).build();
        this.geminiApiKey = geminiApiKey;
        this.geminiApiPrompt = geminiApiPrompt;
        this.objectMapper = objectMapper;
    }

    @Override
    public AnalysisResultDto analyze(MultipartFile image) {
        try {
            // 1. 이미지 데이터 인코딩
            String base64ImageData = Base64.getEncoder().encodeToString(image.getBytes());

            // 2. 요청 객체 생성
            GeminiRequest request = buildGeminiRequest(base64ImageData, image.getContentType());

            // 3. API 호출
            GeminiResponse response = webClient.post()
                    .uri(uriBuilder -> uriBuilder.queryParam("key", geminiApiKey).build())
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(GeminiResponse.class)
                    .block();

            // 4. 응답 파싱
            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                if (response.getCandidates().get(0).getContent() != null &&
                        !response.getCandidates().get(0).getContent().getParts().isEmpty()) {

                    String jsonText = response.getCandidates().get(0).getContent().getParts().get(0).getText();

                    // Gemini API 응답 JSON 로그
                    log.info("=== Gemini API Response ===");
                    log.info(jsonText);
                    log.info("===========================");

                    Object parsedData = objectMapper.readValue(jsonText, Object.class);
                    
                    return new AnalysisResultDto(parsedData);
                }
            }

            throw new RuntimeException("Gemini API 응답이 비어있거나 유효하지 않습니다.");

        } catch (IOException e) {
            throw new RuntimeException("이미지 처리 또는 API 응답 파싱 중 오류 발생", e);
        }
    }

    private GeminiRequest buildGeminiRequest(String base64Data, String mimeType) {
        // 1. 텍스트 파트
        Part textPart = new Part(this.geminiApiPrompt, null);

        // 2. 이미지 파트
        InlineData inlineData = new InlineData(mimeType, base64Data);
        Part imagePart = new Part(null, inlineData);

        // 3. 컨텐츠 조립
        ContentPart contentPart = new ContentPart(List.of(textPart, imagePart));

        // 4. 설정 조립
        GeminiGenerationConfig config = new GeminiGenerationConfig("application/json");

        return new GeminiRequest(Collections.singletonList(contentPart), config);
    }
}
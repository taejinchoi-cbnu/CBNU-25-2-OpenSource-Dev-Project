package com.example.server.image.dto.gemini;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeminiRequest {
    @JsonProperty("contents")
    private List<ContentPart> contents;

    @JsonProperty("generation_config") // snake_case 매핑
    private GeminiGenerationConfig generationConfig;
}
package com.example.server.image.dto.gemini;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // null 필드 제외
@JsonIgnoreProperties(ignoreUnknown = true) // API 응답의 알 수 없는 필드 무시
public class Part {
    @JsonProperty("text")
    private String text;

    @JsonProperty("inline_data") // API 스펙: inline_data
    private InlineData inlineData;

    // 편의 메서드
    public Part(String text) { this.text = text; }
    public Part(InlineData inlineData) { this.inlineData = inlineData; }
}
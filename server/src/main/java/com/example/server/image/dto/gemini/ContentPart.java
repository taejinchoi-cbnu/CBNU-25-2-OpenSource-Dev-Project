package com.example.server.image.dto.gemini;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)  // Gemini API 응답의 알 수 없는 필드 무시
public class ContentPart {
    @JsonProperty("parts")
    private List<Part> parts;


    @JsonProperty("role")
    private String role;

    public ContentPart(List<Part> parts) {
        this.parts = parts;
        this.role = null;
    }
}
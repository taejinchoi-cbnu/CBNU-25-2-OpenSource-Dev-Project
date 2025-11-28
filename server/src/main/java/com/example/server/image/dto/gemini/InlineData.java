package com.example.server.image.dto.gemini;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InlineData {
    @JsonProperty("mime_type") // API 스펙: mime_type
    private String mimeType;

    @JsonProperty("data")
    private String data;
}
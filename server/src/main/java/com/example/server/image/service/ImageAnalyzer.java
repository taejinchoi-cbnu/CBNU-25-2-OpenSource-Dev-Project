package com.example.server.image.service;

import org.springframework.web.multipart.MultipartFile;
import com.example.server.image.dto.AnalysisResultDto;

public interface ImageAnalyzer {
    AnalysisResultDto analyze(MultipartFile image);
}

package com.example.server.image.service;

import com.example.server.image.dto.AnalysisResultDto;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;
import java.util.List;

@Service
public class ImageService {

    private final ImageAnalyzer imageAnalyzer;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList("image/jpeg", "image/png", "image/gif", "image/webp");

    @Autowired
    public ImageService(ImageAnalyzer imageAnalyzer) {
        this.imageAnalyzer = imageAnalyzer;
    }

    public AnalysisResultDto analyzeImage(MultipartFile image) {
        validateImage(image);
        return imageAnalyzer.analyze(image);
    }

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Image file is empty or null.");
        }

        if (!ALLOWED_CONTENT_TYPES.contains(image.getContentType())) {
            throw new IllegalArgumentException("Invalid image file type: " + image.getContentType());
        }

        if (image.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Image file size exceeds the limit of 5MB.");
        }
    }
}

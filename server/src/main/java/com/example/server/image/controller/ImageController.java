package com.example.server.image.controller;

import com.example.server.image.dto.AnalysisResultDto;
import com.example.server.image.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;

    @Autowired
    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping(value = "/analyze", produces = "application/json; charset=UTF-8")
    public ResponseEntity<AnalysisResultDto> analyzeImage(@RequestParam("image") MultipartFile image) {
        AnalysisResultDto result = imageService.analyzeImage(image);
        return ResponseEntity.ok(result);
    }
}

package com.example.server.user.controller;

import com.example.server.user.dto.ProfileResponse;
import com.example.server.user.dto.ProfileUpdateRequest;
import com.example.server.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "사용자 프로필 조회 및 수정 API")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "내 프로필 조회", description = "현재 로그인된 사용자의 프로필 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "프로필 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    public ResponseEntity<ProfileResponse> getMyProfile(@AuthenticationPrincipal UUID userId) {
        ProfileResponse profileResponse = userService.getProfile(userId);
        return ResponseEntity.ok(profileResponse);
    }

    @PatchMapping("/me")
    @Operation(summary = "내 프로필 수정", description = "현재 로그인된 사용자의 프로필(닉네임)을 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "프로필 수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    public ResponseEntity<Void> updateMyProfile(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        userService.updateProfile(userId, request);
        return ResponseEntity.ok().build();
    }
}

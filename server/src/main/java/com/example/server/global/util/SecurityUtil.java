package com.example.server.global.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public class SecurityUtil {

    private SecurityUtil() {
        // 인스턴스화 방지
    }

    public static UUID getCurrentUserId() {
        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Security Context에 인증 정보가 없습니다.");
        }

        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("잘못된 사용자 ID 형식입니다.");
        }
    }
}

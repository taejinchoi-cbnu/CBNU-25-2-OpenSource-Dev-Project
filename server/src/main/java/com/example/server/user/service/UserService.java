package com.example.server.user.service;

import com.example.server.user.dto.ProfileResponse;
import com.example.server.user.dto.ProfileUpdateRequest;
import com.example.server.user.entity.User;
import com.example.server.user.exception.UserNotFoundException;
import com.example.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public ProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("해당 ID의 사용자를 찾을 수 없습니다: " + userId));

        return ProfileResponse.from(user);
    }

    @Transactional
    public void updateProfile(UUID userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("해당 ID의 사용자를 찾을 수 없습니다: " + userId));

        if (request.getNickname().equals(user.getNickname())) {
            return;
        }

        user.updateNickname(request.getNickname());
    }
}
package com.mysite.sbb.question;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; // List를 import 합니다.

public interface QuestionRepository extends JpaRepository<Question, Integer> {
    // 반환 타입을 List<Question>으로 변경
    List<Question> findBySubject(String subject);
}
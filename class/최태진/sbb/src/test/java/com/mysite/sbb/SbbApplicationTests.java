package com.mysite.sbb;

import com.mysite.sbb.question.Question;
import com.mysite.sbb.question.QuestionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional; // Transactional import

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.Optional;

@SpringBootTest
class SbbApplicationTests {

    @Autowired
    private QuestionRepository questionRepository;

    @Test
    @Transactional// 테스트 환경에서는 기본적으로 롤백되지만, 명시적으로 선언해주는 것이 좋습니다.
    @Rollback(false) // 테스트 결과 메인 서버에서도 보려면 롤백 false 해줘야함.
    void testJpaUpdate() { // 메서드 이름을 더 명확하게 변경
        // 1. 테스트용 데이터 생성 및 저장
        Question originalQuestion = new Question();
        originalQuestion.setSubject("원본 제목");
        originalQuestion.setContent("원본 내용");
        originalQuestion.setCreateDate(LocalDateTime.now());
        this.questionRepository.save(originalQuestion);
        Integer id = originalQuestion.getId(); // 저장된 데이터의 id를 가져옴

        // 2. 데이터 조회 및 수정
        Optional<Question> oq = this.questionRepository.findById(id);
        assertTrue(oq.isPresent());
        Question q = oq.get();
        q.setSubject("수정된 제목");
        // this.questionRepository.save(q); // 더티 체킹에 의해 이 라인은 생략 가능합니다.

        // 3. 수정이 잘 되었는지 검증 (중요!)
        // DB에서 데이터를 다시 조회하여 확인
        Optional<Question> updatedOq = this.questionRepository.findById(id);
        assertTrue(updatedOq.isPresent());
        Question updatedQ = updatedOq.get();
        assertEquals("수정된 제목", updatedQ.getSubject());
    }
}
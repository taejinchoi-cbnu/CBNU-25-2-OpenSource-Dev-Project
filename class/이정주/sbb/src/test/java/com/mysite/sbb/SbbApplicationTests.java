package com.mysite.sbb;

import static org.junit.jupiter.api.Assertions.assertTrue;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class SbbApplicationTests {

    @Autowired
    private QuestionRepository questionRepository;

    @Test
    void testJpa() {
        var oq = questionRepository.findById(1);
        assertTrue(oq.isPresent());
        var q = oq.get();
        q.setSubject("수정된 제목");
        questionRepository.save(q);
    }
}

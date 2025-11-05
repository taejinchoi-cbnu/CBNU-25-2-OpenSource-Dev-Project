package com.mysite.sbb;

import java.time.LocalDateTime;


import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SbbApplication {

    public static void main(String[] args) {
        SpringApplication.run(SbbApplication.class, args);
    }

    @Bean
    CommandLineRunner seed(QuestionRepository repo) {
        return args -> {
            var q1 = new Question();
            q1.setSubject("sbb가 무엇인가요?");
            q1.setContent("sbb에 대해서 알고 싶습니다.");
            q1.setCreateDate(LocalDateTime.now());
            repo.save(q1);

            var q2 = new Question();
            q2.setSubject("스프링부트 모델 질문입니다.");
            q2.setContent("id는 자동으로 생성되나요?");
            q2.setCreateDate(LocalDateTime.now());
            repo.save(q2);

            System.out.println("QUESTION count = " + repo.count());
        };
    }
}

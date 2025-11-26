package com.example.server.board.entity;

import com.example.server.auth.entity.AuthUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "comments")  // 댓글 저장 테이블 이름
@Getter
@Setter
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT") // 댓글 내용, Text 타입 사용, nullable = false : 내용 없으면 false
    private String content; // 길이 제한 없는 문자열 저장 가능

    @ManyToOne(fetch = FetchType.LAZY) // 댓글 작성자와 다대일
    @JoinColumn(name = "author_id", nullable = false)
    private AuthUser author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;


    @CreationTimestamp // 생성시간
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp // 수정시간
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}

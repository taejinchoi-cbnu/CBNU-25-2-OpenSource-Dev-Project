package com.example.server.board.entity;

import com.example.server.auth.entity.AuthUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "posts")   // 실제 DB 테이블 이름을 명시
@Getter
@Setter
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) // 제목은 필수 항목
    private String title;


    @Column(columnDefinition = "TEXT") // 길이 제한 없는 텍스트 저장
    private String content;

    /**
     * 게시글 작성자 (AuthUser 엔티티와 다대일 관계)
     * LAZY 로딩 → author가 사용될 때만 쿼리 실행
     * JoinColumn = author_id → posts.author_id FK 생성
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private AuthUser author;

    /**
     * 조회수
     * nullable=false 기본값 0
     * increaseViewCount() 메소드로 증가 처리
     */
    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @CreationTimestamp // Hibernate INSERT 시 자동으로 시간 입력
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp // Update시 시간 자동 갱신
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true) // Post 1개당 Comments N개
    private List<Comment> comments;

    public void increaseViewCount() {
        this.viewCount++; // 조회수 증가 메소드
    }
}

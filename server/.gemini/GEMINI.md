# 서버 아키텍처 가이드 (Server Architecture Guide)

## 개요

이 문서는 CBNU-25-2-OpenSource-Dev-Project에서 진행하는 **이미지 시각화 시스템** 서버 애플리케이션의 아키텍처를 정의하고 설명합니다. 모든 코드 생성, 수정, 리뷰 작업은 본 아키텍처 가이드를 따라 일관성을 유지하는 것을 목표로 합니다.

## 1. 프로젝트 개요

- **프로젝트명**: 이미지 시각화 시스템
- **목표**: 충북대학교 포털 '개신누리'의 성적표 스크린샷을 AI OCR로 분석하여, 학생들의 학업 성취도 시각화 및 커뮤니티 기능을 제공하는 웹 서비스 개발
- **주요 기능**:
  1.  **AI 성적 분석**: 성적표 이미지에서 과목, 학점, 등급 등 데이터를 추출하여 JSON으로 정형화
  2.  **학업 성취도 시각화**: GPA 추이(선 그래프), 이수 학점 현황(도넛 차트), 성적 분포(막대 차트) 등 제공
  3.  **사용자 및 커뮤니티**: 사용자 인증, 성적 데이터 관리, 익명 커뮤니티 게시판 기능
- **기술 스택**:
  - **Backend**: Java, Spring Boot
  - **Frontend**: React.ts
  - **AI/ML**: Python
  - **Database**: Supabase
  - **Version Control**: Git / GitHub

## 2. 아키텍처 스타일

본 서버는 **도메인 주도 설계(DDD)의 핵심 사상을 적용한 모듈형 계층 아키텍처(Modular Layered Architecture)**를 지향합니다.

- **모듈형 (Modular)**: 최종적으로는 `user`, `board`, `grade` 등 비즈니스 기능(도메인) 단위로 패키지를 구성하는 것을 목표로 합니다. 현재는 `auth`와 `board` 모듈이 구현되어 있습니다.
- **계층형 (Layered)**: 각 모듈 내부는 `Controller` - `Service` - `Repository`의 계층으로 분리하여 역할과 책임을 명확히 합니다.
- **헥사고날 아키텍처 (Hexagonal Architecture) 원칙 적용**: `global/storage`, `ai/client` 등 외부 기술과의 연동을 '어댑터' 형태로 분리하여, 핵심 비즈니스 로직이 외부 변화에 영향을 받지 않도록 합니다.

## 3. 전체 디렉토리 구조 (2025-11-07 기준)

```
/src/main/java/com/example/server
├── 📄 ServerApplication.java
├── 📁 config/         // ... 전역 설정
├── 📁 global/        // ... 공통 모듈 (JWT, 예외 처리 등)
├── 📁 auth/          // 👤 사용자 인증
├── 📁 board/         // 📝 게시판
│   ├── 📄 BoardController.java
│   ├── 📁 dto/
│   ├── 📁 entity/
│   ├── 📁 exception/
│   ├── 📁 repository/
│   └── 📁 service/
└── 📁 image/         // (미구현)
```

## 4. 주요 디렉토리 및 파일 역할

(생략...)

---

## 5. 개발 진행 상황 및 다음 단계 (2025-11-07 기준)

### 완료된 작업 (Completed Tasks)

1.  **요구사항 정의 및 설계**
2.  **프로젝트 구조화 및 초기 설정**
3.  **사용자 인증 시스템 구현 (P1)**
    - Supabase Auth 연동을 통한 `signup`, `login`, `refresh`, `logout` API 구현
    - `HttpOnly` 쿠키를 사용한 `Refresh Token` 처리
    - JWKS 기반의 `Access Token` 검증을 위한 `JwtAuthFilter` 구현

4.  **게시판 기능 구현 (P0)**
    - **DB 설계 및 Entity 매핑**: `posts`, `comments` 테이블 스키마를 정의하고 JPA `Post`, `Comment` 엔티티를 작성했습니다.
    - **계층별 API 구현**: Bottom-up 방식에 따라 `Repository`, `DTO`, `Service`, `Controller` 계층을 모두 구현하여 **게시글과 댓글의 CRUD API를 완성**했습니다.
    - **API 경로 개선**: 유지보수와 확장성을 고려하여 API 경로를 `/api/board/posts` 기준으로 재설계했습니다.
    - **예외 처리**: `PostNotFoundException`, `CommentNotFoundException` 등 비즈니스 예외를 정의하고 `GlobalExceptionHandler`에 등록하여 처리했습니다.
    - **API 문서화**: `Swagger` 어노테이션을 추가하여 API 명세를 자동화하고, 별도의 Markdown(`docs/api/board.md`) 문서도 작성했습니다.
    - **트러블슈팅**: 구현 과정에서 발생한 DB 연결, 스키마 불일치, 인증 오류 등 **모든 문제를 해결**하고 회고 문서(`docs/board회고.md`)에 상세히 기록했습니다.

5.  **이미지 분석 API 엔드포인트 개발 (완료)**
    *   **목표**: 클라이언트로부터 성적표 이미지를 받아 AI로 분석하고, 그 결과를 가공하여 반환하는 API 구현 완료.
    *   **주요 작업**:
        1.  **`ImageAnalyzer` 인터페이스 설계**: (완료)
        2.  **`GeminiApiAnalyzer` 구현**: (완료)
        3.  **`image` 도메인 생성**: (완료)
        4.  **`ImageController` 구현**: (완료)
        5.  **`ImageService` 구현**: (완료)
        6.  **프롬프트 엔지니어링 및 JSON 포맷 확정**: (완료)
        7.  **구조화된 응답 DTO 구현**: (완료)
        8.  **`SecurityConfig` 업데이트**: (완료)
        9.  **Gemini API Key 설정**: (완료)

### 다음 작업 계획 (Next Steps)

1.  **유지보수 및 성능 최적화**
    - API 응답 속도 개선 및 안정성 확보.

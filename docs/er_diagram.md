# Entity Relationship Diagram (ERD)

## 데이터베이스 스키마 구조

```mermaid
erDiagram
    %% Auth Schema (Supabase Managed)
    USERS {
        UUID id PK "Primary Key"
        String email "User Email"
        JSON raw_user_meta_data "Metadata (nickname, etc)"
        Timestamp created_at
    }

    %% Public Schema
    POSTS {
        Long id PK "Primary Key"
        String title "Post Title"
        String content "Post Content (TEXT)"
        UUID author_id FK "Foreign Key -> USERS.id"
        Integer view_count "Default 0"
        OffsetDateTime created_at "Created timestamp"
        OffsetDateTime updated_at "Updated timestamp"
    }

    COMMENTS {
        Long id PK "Primary Key"
        String content "Comment Content (TEXT)"
        UUID author_id FK "Foreign Key -> USERS.id"
        Long post_id FK "Foreign Key -> POSTS.id"
        OffsetDateTime created_at "Created timestamp"
        OffsetDateTime updated_at "Updated timestamp"
    }

    %% Relationships
    USERS ||--o{ POSTS : "writes"
    USERS ||--o{ COMMENTS : "writes"
    POSTS ||--o{ COMMENTS : "has"
```

### 설명
- **USERS**: Supabase Auth의 `auth.users` 테이블입니다. 사용자의 기본 정보와 메타데이터(닉네임 등)를 저장합니다.
- **POSTS**: 게시판의 게시글 정보를 저장합니다. `author_id`를 통해 작성자와 연결됩니다.
  - `view_count`: 조회수 (기본값 0)
  - `created_at`, `updated_at`: 생성 및 수정 시각 (OffsetDateTime 타입)
- **COMMENTS**: 게시글에 달린 댓글 정보를 저장합니다. `post_id`로 게시글과, `author_id`로 작성자와 연결됩니다.
  - `created_at`, `updated_at`: 생성 및 수정 시각 (OffsetDateTime 타입)

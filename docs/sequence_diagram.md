# Sequence Diagram

## 1. 성적표 이미지 분석 흐름 (Image Analysis Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as 사용자 (Client)
    participant Client as React App
    participant Server as Spring Boot
    participant Service as ImageService
    participant OCR as Gemini API (Analyzer)
    
    Note over User, Client: 1. 이미지 업로드
    User->>Client: 이미지 파일 선택 (Drag & Drop)
    Client->>Client: 파일 유효성 검사 (Size < 5MB, Type)
    
    alt 유효하지 않은 파일
        Client-->>User: 에러 토스트 (Invalid File)
    else 유효한 파일
        Client->>Server: POST /api/images/analyze (MultipartFile)
        activate Server
        
        Server->>Service: analyzeImage(image)
        activate Service
        
        Service->>Service: 서버 측 유효성 재검사
        
        Service->>OCR: analyze(image)
        activate OCR
        Note right of OCR: 1. 이미지 텍스트 추출<br/>2. JSON 구조화 (Prompting)
        OCR-->>Service: JSON String
        deactivate OCR
        
        Service->>Service: JSON -> AnalysisResultDto 매핑
        Service-->>Server: AnalysisResultDto
        deactivate Service
        
        Server-->>Client: 200 OK (AnalysisResultDto)
        deactivate Server
        
        Note over Client: 2. 데이터 검증 (Step 2)
        Client->>User: 검증 테이블 표시
        
        User->>Client: 데이터 수정 및 확인
        Client->>Client: 차트 렌더링 (Recharts)
        Client-->>User: 성적 리포트 화면 (/result)
    end
```

## 2. 게시글 작성 흐름 (Post Creation Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as 사용자
    participant Client as React App
    participant Server as Spring Boot
    participant DB as Supabase (PostgreSQL)
    
    User->>Client: 게시글 작성 버튼 클릭
    
    alt 미로그인 상태
        Client-->>User: 로그인 페이지로 리다이렉트
    else 로그인 상태
        Client->>User: 에디터 페이지 표시
        User->>Client: 제목/내용 입력 후 '등록' 클릭
        
        Client->>Server: POST /api/board/posts
        Note right of Client: Header: Authorization (Bearer Token)
        Note right of Client: Body: { title, content }
        
        activate Server
        Server->>Server: 토큰 검증 (JwtAuthFilter)
        Server->>DB: INSERT INTO posts
        activate DB
        DB-->>Server: Created Post Entity
        deactivate DB
        
        Server-->>Client: 200 OK (Post DTO)
        deactivate Server
        
        Client->>Client: Query Cache 무효화 (invalidate 'posts')
        Client->>Client: 목록 페이지로 이동
        Client->>Server: GET /api/board/posts (Refetch)
        activate Server
        Server-->>Client: 갱신된 게시글 목록
        deactivate Server
        Client->>Client: 새로운 데이터 캐싱 (Update Cache)
        Client-->>User: 목록 화면 표시
    end
```

## 3. 인증 흐름 (Authentication Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as 사용자
    participant Client as React App
    participant Server as Spring Boot
    participant Auth as Supabase Auth API
    
    Note over User, Auth: 로그인 프로세스
    User->>Client: 이메일/비밀번호 입력 및 로그인 클릭
    Client->>Server: POST /api/auth/login
    activate Server
    
    Server->>Auth: POST /auth/v1/token (grant_type=password)
    activate Auth
    Auth-->>Server: Access Token, Refresh Token, User Info
    deactivate Auth
    
    Server->>Server: Refresh Token 쿠키 생성 (HttpOnly)
    Server-->>Client: 200 OK (AccessToken, User Info) + Set-Cookie
    deactivate Server
    
    Client->>Client: AccessToken 메모리(Zustand) 저장
    Client-->>User: 메인 페이지 이동
    
    Note over Client, Server: 토큰 갱신 (Silent Refresh)
    Client->>Server: POST /api/auth/refresh (Cookie)
    activate Server
    Server->>Auth: POST /auth/v1/token (grant_type=refresh_token)
    activate Auth
    Auth-->>Server: New Access/Refresh Tokens
    deactivate Auth
    Server-->>Client: 200 OK (New AccessToken) + Set-Cookie
    deactivate Server
```

## 4. 프로필 관리 흐름 (Profile Management Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as 사용자
    participant Client as React App
    participant Server as Spring Boot
    participant DB as Supabase DB
    
    Note over User, DB: 내 프로필 조회
    User->>Client: 프로필 페이지 접속
    Client->>Server: GET /api/users/me
    activate Server
    Server->>DB: SELECT * FROM users WHERE id = ?
    activate DB
    DB-->>Server: User Entity (with Posts/Comments)
    deactivate DB
    Server-->>Client: 200 OK (ProfileResponse)
    deactivate Server
    Client-->>User: 프로필 정보 및 활동 내역 표시
    
    Note over User, DB: 닉네임 수정
    User->>Client: 닉네임 변경 후 '저장' 클릭
    Client->>Server: PATCH /api/users/me
    activate Server
    Server->>DB: SELECT * FROM users WHERE id = ?
    activate DB
    DB-->>Server: User Entity
    deactivate DB
    
    Server->>Server: 닉네임 변경 (Metadata Update)
    Server->>DB: UPDATE users SET raw_user_meta_data = ...
    activate DB
    DB-->>Server: Success
    deactivate DB
    
    Server-->>Client: 200 OK
    deactivate Server
    Client->>Client: 프로필 쿼리 무효화 (invalidate 'profile')
    Client->>Server: GET /api/users/me (Refetch)
    activate Server
    Server-->>Client: 갱신된 프로필 정보
    deactivate Server
    Client->>Client: 프로필 데이터 캐싱 (Update Cache)
    Client-->>User: 변경된 닉네임 표시
```

## 5. 토큰 만료 및 갱신 흐름 (Token Expiration & Retry Flow)

```mermaid
sequenceDiagram
    autonumber
    participant Client as React App (Interceptor)
    participant Server as Spring Boot
    
    Note over Client, Server: API 요청 중 토큰 만료 발생 시
    Client->>Server: API Request (Expired Access Token)
    activate Server
    Server-->>Client: 401 Unauthorized
    deactivate Server
    
    Client->>Client: Interceptor: 401 감지
    
    Client->>Server: POST /api/auth/refresh (Cookie: Refresh Token)
    activate Server
    Server-->>Client: 200 OK (New Access Token)
    deactivate Server
    
    Client->>Client: 새 토큰 저장 (Zustand)
    
    Client->>Server: Retry Original Request (New Access Token)
    activate Server
    Server-->>Client: 200 OK (Success)
    deactivate Server
```

## 6. 데이터 캐싱 및 동기화 흐름 (Data Caching & Synchronization Flow)

```mermaid
sequenceDiagram
    autonumber
    participant User as 사용자
    participant UI as React Component
    participant Query as TanStack Query (Cache)
    participant Server as Spring Boot API

    Note over User, Server: 1. 초기 데이터 진입 (Initial Fetch)
    User->>UI: 게시판 페이지 접속
    UI->>Query: useQuery(['posts']) 호출
    Query->>Query: Cache Miss (데이터 없음)
    Query->>Server: GET /api/board/posts
    activate Server
    Server-->>Query: 게시글 목록 데이터
    deactivate Server
    Query->>Query: 데이터 캐싱 (staleTime: 0)
    Query-->>UI: Data (isFetching: false)
    UI-->>User: 게시글 목록 표시

    Note over User, Server: 2. 데이터 재진입 (Background Refetch)
    User->>UI: 다른 페이지 갔다가 다시 돌아옴
    UI->>Query: useQuery(['posts']) 호출
    Query->>Query: Cache Hit (Stale Data)
    Query-->>UI: Cached Data (즉시 표시)
    
    par Background Refetch
        Query->>Server: GET /api/board/posts
        activate Server
        Server-->>Query: 최신 데이터
        deactivate Server
        Query->>Query: 캐시 업데이트
        Query-->>UI: New Data (필요 시 리렌더링)
    end

    Note over User, Server: 3. 데이터 변경 시 (Mutation & Invalidation)
    User->>UI: 새 글 작성 완료
    UI->>Query: queryClient.invalidateQueries(['posts'])
    Query->>Query: 'posts' 쿼리를 Stale 상태로 마킹
    
    opt Active Observers (현재 보고 있는 경우)
        Query->>Server: GET /api/board/posts (Auto Refetch)
        activate Server
        Server-->>Query: 최신 데이터
        deactivate Server
        Query->>Query: 캐시 업데이트
        Query-->>UI: 최신 목록으로 UI 갱신
    end
```

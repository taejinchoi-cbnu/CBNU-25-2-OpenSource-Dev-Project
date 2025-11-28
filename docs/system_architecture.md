# System Architecture

## 전체 시스템 아키텍처

```mermaid
graph TD
    subgraph Client ["Client Layer (Browser)"]
        ReactApp["React Application<br/>(Vite + TypeScript)"]
        Zustand["State Management<br/>(Zustand + TanStack Query)"]
        Axios["API Client<br/>(Axios)"]
        
        ReactApp <--> Zustand
        ReactApp <--> Axios
    end

    subgraph Server ["Server Layer (AWS/Docker)"]
        SpringBoot["Spring Boot Server"]
        Security["Spring Security<br/>(JWT Filter)"]
        Controller["REST Controllers"]
        Service["Business Logic"]
        Repository["JPA Repositories"]
        
        SpringBoot --> Security
        Security --> Controller
        Controller --> Service
        Service --> Repository
    end

    subgraph Infrastructure ["Infrastructure Layer"]
        DB[("Supabase DB<br/>(PostgreSQL)")]
        Auth[("Supabase Auth")]
        Gemini[("Google Gemini API<br/>(OCR Model)")]
    end

    %% Data Flow
    Axios -- "REST API (JSON)" --> SpringBoot
    
    %% Auth Flow
    Service -- "Verify Token / User Info" --> Auth
    
    %% DB Flow
    Repository -- "JDBC / Hibernate" --> DB
    
    %% AI Flow
    Service -- "Image Analysis Request" --> Gemini
    Gemini -- "Analysis Result (JSON)" --> Service

    %% Styling
    classDef client fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    classDef server fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef infra fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    
    class ReactApp,Zustand,Axios client;
    class SpringBoot,Security,Controller,Service,Repository server;
    class DB,Auth,Gemini infra;
```

### 기술 스택 및 역할
1.  **Client (Frontend)**
    *   **React + Vite**: 빠른 개발 및 빌드 환경 제공.
    *   **Zustand**: 전역 상태(인증) 관리.
    *   **TanStack Query**: 서버 상태(게시글, 댓글) 캐싱 및 동기화.

2.  **Server (Backend)**
    *   **Spring Boot**: 안정적인 REST API 서버 구축.
    *   **Spring Security**: JWT 기반의 인증/인가 처리.
    *   **JPA (Hibernate)**: 객체 지향적인 데이터베이스 접근.

3.  **Infrastructure**
    *   **Supabase**: PostgreSQL 데이터베이스 및 인증 서비스 제공.
    *   **Gemini API**: 성적표 이미지의 텍스트 추출 및 구조화(OCR) 담당.

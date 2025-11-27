# 프로젝트 최상위 가이드 (Root Project Guide)

## 1. 이 문서의 목적

이 문서는 **이미지 시각화 시스템** 프로젝트 전체에 적용되는 공통 가이드라인, 정책, 워크플로우를 정의합니다. 이 문서는 프로젝트의 일관성을 유지하고 모든 구성원(AI 에이전트 포함)이 동일한 규칙에 따라 협업하는 것을 목표로 합니다.

- **클라이언트** 관련 상세 아키텍처는 `client/.gemini/GEMINI.md`를 참고하십시오.
- **서버** 관련 상세 아키텍처는 `server/.gemini/GEMINI.md`를 참고하십시오.

## 2. 프로젝트 개요

- **프로젝트명**: 이미지 시각화 시스템
- **목표**: 성적표 스크린샷 이미지 분석, 학업 성취도 시각화, 커뮤니티 기능을 제공하는 풀스택 웹 애플리케이션 개발.
- **기술 스택**:
  - **Frontend**: React, TypeScript, Vite
  - **Backend**: Java, Spring Boot
  - **Database**: Supabase (PostgreSQL)
  - **Containerization**: Docker, Docker Compose

## 3. 전역 가이드라인 (Global Guidelines)

### Git 워크플로우 (Git Workflow)

- **브랜치 전략**: `Git-flow`를 기반으로 한 브랜치 전략을 따릅니다.
  - `main`: 제품으로 출시될 수 있는 브랜치.
  - `develop`: 다음 릴리즈를 개발하는 브랜치. (모든 `feature` 브랜치의 통합 지점)
  - `feature/{기능}`: 새로운 기능 개발 브랜치.
  - `fix/{수정사항}`: 버그 수정 브랜치.
  - `docs/{문서}`: 문서 추가 또는 수정 브랜치.

- **커밋 메시지 규칙**: Conventional Commits 규칙을 따릅니다.
  - `feat`: 새로운 기능 추가
  - `fix`: 버그 수정
  - `docs`: 문서 수정
  - `style`: 코드 포맷팅, 세미콜론 누락 등 (코드 변경이 없는 경우)
  - `refactor`: 코드 리팩토링
  - `test`: 테스트 코드 추가, 리팩토링
  - `chore`: 빌드 업무 수정, 패키지 매니저 설정 등 (프로덕션 코드 변경이 없는 경우)
  - `ci`: CI 관련 설정 수정

### Docker 개발 환경 (Docker Development Environment)

- **실행**: 프로젝트의 전체 스택은 Docker Compose를 통해 실행하는 것을 원칙으로 합니다.
  - `docker-compose up --build`: 이미지 빌드 및 컨테이너 실행
  - `docker-compose down`: 컨테이너 중지 및 제거
- **환경 변수**: 서버 실행에 필요한 민감 정보(DB 연결 정보 등)는 프로젝트 루트의 `.env` 파일에 정의합니다. 이 파일은 `.gitignore`에 의해 버전 관리에서 제외됩니다.
- **개발 방식**:
  1. **Local-First**: 로컬 머신에서 각 서버(`npm run dev`, IntelliJ 실행)를 띄워 개발하고, 최종 통합 테스트 시에만 Docker를 활용합니다.
  2. **Docker-First**: Docker 볼륨을 사용하여 로컬 코드와 컨테이너를 동기화하고, 핫 리로딩을 통해 컨테이너 환경에서 직접 개발을 진행합니다. (심화)

### AI 에이전트 협업 규칙

- 코드 수정 후에는 반드시 `빌드` 또는 `테스트` 명령을 실행하여 변경사항의 유효성을 스스로 검증합니다.
- 새로운 파일을 임포트하거나 참조하기 전에는, `glob`이나 `list_directory` 도구를 사용하여 해당 파일이 실제로 존재하는지 명시적으로 확인합니다.

## 4. 도메인별 아키텍처 가이드

- **Client (React)**
  - 클라이언트 관련 아키텍처, 라이브러리 사용 규칙(`Zustand`, `TanStack Query` 등), 코딩 스타일, 컴포넌트 구조 등은 아래 파일을 참고하십시오.
  - **경로**: `client/.gemini/GEMINI.md`

- **Server (Spring Boot)**
  - 서버 관련 아키텍처, 계층 구조, API 설계 원칙, DB 스키마, 예외 처리 정책 등은 아래 파일을 참고하십시오.
  - **경로**: `server/.gemini/GEMINI.md`
  - **주요 규칙 예시**: `application.properties`는 `.gitignore`에 등록되어 있으며, 모든 설정은 이 단일 파일을 사용합니다.

## 5. 다음 작업 계획

1.  **이미지 처리 기능 구현**: 성적표 스크린샷 이미지 업로드, AI 분석 요청, 결과 시각화 기능을 개발합니다. (완료 - 2단계 데이터 검증까지 완료)
    - 상세 내용은 `client/.gemini/GEMINI.md` 및 `server/.gemini/GEMINI.md`를 참고하십시오.

2.  **고도화 및 오류 해결 (3단계)**:
    - 이미지 분석 결과의 시각화 진행 및 예외 케이스 처리.
    - 시각화 고도화 (차트 디자인 개선, 인터랙션 추가).

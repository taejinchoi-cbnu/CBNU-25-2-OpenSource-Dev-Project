# 클라이언트 아키텍처 가이드 (Client Architecture Guide)

## 개요

이 문서는 CBNU-25-2-OpenSource-Dev-Project에서 진행하는 **이미지 시각화 시스템** 클라이언트 애플리케이션의 아키텍처를 정의하고 설명합니다. 모든 코드 생성, 수정, 리뷰 작업은 본 아키텍처 가이드를 따라 일관성을 유지하는 것을 목표로 합니다.

## 1. 프로젝트 개요

- **프로젝트명**: 이미지 시각화 시스템 (Client)
- **목표**: 서버와 연동하여 성적 분석 결과를 시각화하고, 사용자 인증 및 커뮤니티 기능을 제공하는 반응형 웹 애플리케이션 개발
- **기술 스택**:
  - **Framework**: React (v19), Vite
  - **Language**: TypeScript
  - **State Management**: Zustand, TanStack Query (React Query)
  - **Routing**: React Router DOM (v7)
  - **API Client**: Axios
  - **Styling**: CSS (별도 UI 프레임워크 없음)
  - **Linting/Formatting**: ESLint, Prettier

## 2. 아키텍처 스타일

본 클라이언트는 **컴포넌트 기반 아키텍처(Component-Based Architecture)**를 따릅니다.

- **모듈화**: 기능별로 `pages`, `components`, `hooks` 등으로 디렉토리를 분리하여 관심사를 분리합니다.
- **상태 관리**:
  - **Zustand**: 사용자 인증 상태(`user`, `accessToken`)와 같이 전역적으로 사용되며, 동기적으로 접근해야 하는 최소한의 상태를 관리합니다.
  - **TanStack Query**: 서버 상태(API 데이터)의 캐싱, 동기화, 로딩/에러 처리를 담당하여 API 호출 로직을 컴포넌트로부터 분리합니다.
- **API 통신**: `axios`를 사용하여 API 클라이언트를 구현하고, `interceptors`를 통해 모든 요청에 인증 토큰을 자동으로 주입합니다.

## 3. 전체 디렉토리 구조 (2025-10-29 기준)

```
/src
├── 📄 App.tsx                 // 최상위 컴포넌트, 라우팅 설정
├── 📄 main.tsx                // 애플리케이션 진입점, Provider 설정
├── 📄 index.css               // 전역 스타일
│
├── 📁 api/                    // API 통신 관련 모듈
│   ├── 📄 client.ts           // Axios 인스턴스 및 인터셉터 설정
│   └── 📄 authService.ts       // 인증 관련 API 호출 함수
│
├── 📁 components/             // 재사용 가능한 UI 컴포넌트
│   ├── 📄 AuthInitializer.tsx   // 앱 시작 시 자동 로그인(silent refresh) 처리
│   ├── 📄 LoadingSpinner.tsx   // 로딩 상태 표시
│   ├── 📄 Navbar.tsx           // 네비게이션 바
│   └── 📄 ProtectedRoute.tsx   // 인증된 사용자만 접근 가능한 경로 보호
│
├── 📁 hooks/                  // 커스텀 훅
│   └── 📄 useLoading.ts        // 비동기 작업 로딩 상태 관리 (현재는 사용되지 않음)
│
├── 📁 pages/                  // 각 페이지 컴포넌트
│   ├── 📄 LoginPage.tsx
│   ├── 📄 SignupPage.tsx
│   ├── 📄 BoardPage.tsx
│   └── 📄 ProfilePage.tsx
│
├── 📁 store/                  // 전역 상태 관리 (Zustand)
│   └── 📄 authStore.ts         // 인증 관련 상태 및 액션
│
└── 📁 types/                  // 전역 타입 정의
    └── 📄 auth.types.ts       // 인증 관련 타입
```

## 4. 주요 파일 및 역할

### `main.tsx`

- 애플리케이션의 진입점입니다.
- `BrowserRouter`로 라우팅을 활성화하고, `QueryClientProvider`로 TanStack Query를 앱 전체에 제공합니다.

### `App.tsx`

- 애플리케이션의 최상위 레이아웃과 라우팅 구조를 정의합니다.
- `AuthInitializer`로 전체 앱을 감싸 앱 로딩 시 인증 상태를 먼저 확인하도록 합니다.
- `Navbar`를 포함하고, `react-router-dom`의 `Routes`와 `Route`를 사용하여 페이지를 설정합니다.

### `api/client.ts`

- `axios` 인스턴스를 생성하고 기본 `baseURL`을 설정합니다.
- **Request Interceptor**: 모든 API 요청 헤더에 Zustand 스토어에 저장된 `accessToken`을 `Bearer` 토큰으로 추가합니다.
- `withCredentials: true`로 설정되어 있어, 서버와 쿠키(Refresh Token)를 주고받을 수 있습니다.

### `api/authService.ts`

- 인증과 관련된 모든 API(login, signup, logout, refresh) 호출 함수를 정의합니다.
- `apiClient`를 사용하여 실제 네트워크 요청을 수행합니다.

### `store/authStore.ts`

- `Zustand`를 사용하여 전역 인증 상태를 관리합니다.
- `user` 정보, `accessToken`, 앱 초기 로딩 상태(`isLoading`)를 포함합니다.
- `setUserToken`, `clearAuth` 등의 액션을 통해 상태를 변경합니다.

### `components/AuthInitializer.tsx`

- 앱이 처음 로드될 때 실행되는 핵심 컴포넌트입니다.
- `useQuery`를 사용하여 `authService.refresh` API를 호출, 자동 로그인(Silent Refresh)을 시도합니다.
- 요청 성공 시 `authStore`에 토큰 정보를 업데이트하고, 실패 시 스토어를 초기화합니다.
- 이 과정이 끝날 때까지 `LoadingSpinner`를 보여주어 사용자 경험을 관리합니다.

### `components/ProtectedRoute.tsx`

- 특정 경로나 컴포넌트를 인증된 사용자만 접근할 수 있도록 보호하는 Wrapper 컴포넌트입니다.
- `authStore`의 `accessToken` 유무를 확인하여, 토큰이 없으면 로그인 페이지(`/login`)로 리다이렉트합니다.

---

# 서버 아키텍처 가이드 (Server Architecture Guide)

# 개발 진행 상황 및 다음 단계

## 완료된 작업

- **프로젝트 초기 설정**: Vite, React, TypeScript 기반 프로젝트 구성 및 ESLint/Prettier 설정 완료.
- **인증 시스템 클라이언트 구현**:
  - 로그인, 회원가입 페이지 및 API 연동 (`useMutation` 활용).
  - 앱 로딩 시 자동 로그인(Silent Refresh) 기능 구현 (`AuthInitializer`).
  - 인증 상태에 따른 네비게이션 바 UI 변경.
  - 인증이 필요한 페이지를 위한 `ProtectedRoute` 구현.
  - `Zustand`를 이용한 전역 인증 상태 관리 및 `React Query`를 이용한 서버 상태 관리 통합.

## 다음 작업 계획

1.  **게시판 기능 구현 (`feature/board`):**
    - **목표**: 사용자들이 정보를 공유할 수 있는 익명 게시판을 구현합니다.
    - **작업 내용**:
      - 게시글 목록 조회, 상세 조회, 작성, 수정, 삭제 API 연동.
      - `BoardPage.tsx`에 목록 UI 구현.
      - 게시글 작성을 위한 별도의 페이지 또는 모달 구현.
      - TanStack Query의 `useQuery`와 `useMutation`을 적극적으로 활용하여 게시판 관련 서버 상태 관리.

# State Diagram

## 클라이언트 상태 관리 (Client State Management)

### 1. 인증 상태 (Auth State - Zustand)

```mermaid
stateDiagram-v2
    [*] --> AuthLoading: App Start (AuthInitializer)
    
    state AuthLoading {
        [*] --> CheckToken: Call /api/auth/refresh
        CheckToken --> Valid: 200 OK
        CheckToken --> Invalid: 401 / Network Error
    }

    AuthLoading --> Authenticated: Valid
    AuthLoading --> Unauthenticated: Invalid

    state Authenticated {
        [*] --> AuthIdle
        AuthIdle --> TokenRefreshing: Token Expired
        TokenRefreshing --> AuthIdle: Success
        AuthIdle --> LoggingOut: Logout Action
    }

    state Unauthenticated {
        [*] --> LoginPending
        LoginPending --> SignupPending: Go to Signup
        SignupPending --> LoginPending: Signup Success
        
        %% Protected Route Guard
        LoginPending --> Forbidden: Access Protected Page
        Forbidden --> LoginPending: Redirect to Login
    }

    %% Cross-boundary transitions
    TokenRefreshing --> Unauthenticated: Refresh Failure
    LoggingOut --> Unauthenticated: Logout Success
    LoginPending --> Authenticated: Login Success
```

### 2. 이미지 분석 상태 (Image Analysis State)

```mermaid
stateDiagram-v2
    [*] --> ImgIdle: Page Loaded (Step 1)

    state ImgIdle {
        [*] --> ImgUploading: Select/Drop Image
    }

    state ImgUploading {
        [*] --> Validating: Client Side Check
        Validating --> Analyzing: Valid
        
        Analyzing --> ImgSuccess: Server Response (200 OK)
    }

    state ImgSuccess {
        [*] --> Verification: Step 2 (Show Table)
        Verification --> Editing: User Modifies Data
        Editing --> Verification: Update State
        Verification --> Visualizing: Confirm Data
    }

    state Visualizing {
        [*] --> Rendering: Navigate to /result
        Rendering --> [*]: Show Charts
    }

    state ImgError {
        [*] --> ImgIdle: Show Toast & Retry
    }

    %% Cross-boundary transitions
    Verification --> ImgIdle: Cancel / Re-upload
    Validating --> ImgError: Invalid File
    Analyzing --> ImgError: Server Error
```

### 3. 게시판 데이터 상태 (Board Data - React Query)

```mermaid
stateDiagram-v2
    [*] --> BoardFetching: Mount / Page Change

    state BoardFetching {
        [*] --> BoardLoading: API Request
        BoardLoading --> BoardSuccess: Data Received
        BoardLoading --> BoardError: Request Failed
    }

    state BoardSuccess {
        [*] --> BoardIdle: Show List
        
        state BoardIdle {
            [*] --> ViewingList
            ViewingList --> ChangingPage: Click Pagination
            ChangingPage --> BoardLoading
            
            ViewingList --> Searching: Enter Search Keyword
            Searching --> BoardLoading
        }

        BoardIdle --> Refetching: Invalidate Query
        Refetching --> BoardLoading
    }

    state BoardError {
        [*] --> BoardForbidden: 403 (Login Required)
        [*] --> GeneralError: Other Errors (Toast)
    }
```

### 4. 프로필 데이터 상태 (Profile Data State)

```mermaid
stateDiagram-v2
    [*] --> ProfileFetching: Mount Profile Page

    state ProfileFetching {
        [*] --> ProfileLoading: GET /api/users/me
        ProfileLoading --> ProfileSuccess: 200 OK
        ProfileLoading --> ProfileError: 401/404 Error
    }

    state ProfileSuccess {
        [*] --> ProfileIdle: Show Info & Activity
        
        state ProfileIdle {
            [*] --> Viewing
            Viewing --> EditingNickname: Click Edit Button
            
            state EditingNickname {
                [*] --> Input: Type New Nickname
                Input --> Saving: Click Save
                Saving --> Viewing: Success (Refetch)
                Saving --> Input: Validation Error
            }
        }
    }

    state ProfileError {
        [*] --> RedirectLogin: 401 Unauthorized
        [*] --> ShowError: Other Errors
    }
```

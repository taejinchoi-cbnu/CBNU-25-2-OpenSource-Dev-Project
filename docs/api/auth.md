# Auth API Documentation

이 문서는 서버의 인증(Auth) 관련 API를 사용하는 방법을 설명합니다.

## 1. 회원가입

- **Endpoint:** `POST /api/auth/signup`
- **Description:** 새로운 사용자를 등록합니다.
- **Content-Type:** `application/json`

### Request Body

| Field      | Type   | Constraints              | Description        |
|------------|--------|--------------------------|--------------------|
| `email`    | String | NotBlank, Email          | 사용자 이메일 (필수)     |
| `password` | String | NotBlank, Size(min = 4)  | 사용자 비밀번호 (필수, 최소 4자) |
| `nickname` | String | NotBlank                 | 사용자 닉네임 (필수)     |

**Example:**
```json
{
  "email": "user@example.com",
  "password": "password1234",
  "nickname": "testuser"
}
```

### Responses

- **`200 OK`**: 회원가입 성공
    - **Body:** `SupabaseUser` 객체. Supabase에서 반환된 사용자 정보입니다.
    ```json
    {
      "id": "...",
      "aud": "authenticated",
      "role": "authenticated",
      "email": "user@example.com",
      "email_confirmed_at": "...",
      "phone": "",
      "confirmed_at": "...",
      "last_sign_in_at": "...",
      "app_metadata": {
        "provider": "email",
        "providers": ["email"]
      },
      "user_metadata": {
        "nickname": "testuser"
      },
      "identities": [...],
      "created_at": "...",
      "updated_at": "..."
    }
    ```
- **`400 Bad Request`**: 요청 데이터가 유효성 검사를 통과하지 못한 경우 (예: 이메일 형식 오류, 비밀번호 길이 부족)
- **`500 Internal Server Error`**: Supabase 연동 중 오류가 발생한 경우

---

## 2. 로그인

- **Endpoint:** `POST /api/auth/login`
- **Description:** 사용자를 인증하고 `Access Token`과 `Refresh Token`을 발급합니다.
- **Content-Type:** `application/json`

### Request Body

| Field      | Type   | Constraints | Description    |
|------------|--------|-------------|----------------|
| `email`    | String | NotBlank, Email | 사용자 이메일 (필수) |
| `password` | String | NotBlank    | 사용자 비밀번호 (필수) |

**Example:**
```json
{
  "email": "user@example.com",
  "password": "password1234"
}
```

### Responses

- **`200 OK`**: 로그인 성공
    - **Header:** `Set-Cookie` 헤더에 `refreshToken`이 `HttpOnly` 쿠키로 설정됩니다.
    - **Body:** `LoginResponse` 객체. `accessToken`과 사용자 정보를 포함합니다.
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "...",
        "aud": "authenticated",
        "role": "authenticated",
        "email": "user@example.com",
        // ... 기타 SupabaseUser 정보
      }
    }
    ```
- **`400 Bad Request`**: 요청 데이터가 유효성 검사를 통과하지 못한 경우
- **`500 Internal Server Error`**: Supabase 연동 중 오류가 발생한 경우 (예: 잘못된 이메일 또는 비밀번호)

---

## 3. 토큰 갱신

- **Endpoint:** `POST /api/auth/refresh`
- **Description:** 만료된 `Access Token`을 `Refresh Token`을 사용하여 갱신합니다.
- **Content-Type:** `application/json`

### Request

- **Cookie:** `refreshToken` 쿠키가 요청에 포함되어야 합니다.

### Responses

- **`200 OK`**: 토큰 갱신 성공
    - **Header:** `Set-Cookie` 헤더에 새로운 `refreshToken`이 `HttpOnly` 쿠키로 설정됩니다.
    - **Body:** `LoginResponse` 객체. 새로운 `accessToken`과 사용자 정보를 포함합니다.
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "...",
        "aud": "authenticated",
        "role": "authenticated",
        "email": "user@example.com",
        // ... 기타 SupabaseUser 정보
      }
    }
    ```
- **`400 Bad Request`**: `refreshToken` 쿠키가 없는 경우
- **`500 Internal Server Error`**: Supabase 연동 중 오류가 발생한 경우 (예: 유효하지 않은 `refreshToken`)

---

## 4. 로그아웃

- **Endpoint:** `POST /api/auth/logout`
- **Description:** 사용자를 로그아웃하고 `Refresh Token` 쿠키를 만료시킵니다.

### Request

- 특별한 요청 본문이나 파라미터가 필요하지 않습니다.

### Responses

- **`200 OK`**: 로그아웃 성공
    - **Header:** `Set-Cookie` 헤더를 통해 `refreshToken` 쿠키가 삭제됩니다.

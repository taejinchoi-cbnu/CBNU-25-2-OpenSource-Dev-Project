# User API Documentation

이 문서는 서버의 사용자(User) 관련 API를 사용하는 방법을 설명합니다.

## 1. 내 프로필 조회

- **Endpoint:** `GET /api/users/me`
- **Description:** 현재 로그인된 사용자의 프로필 정보(이메일, 닉네임, 작성 글/댓글 요약)를 조회합니다.
- **Content-Type:** `application/json`

### Request Headers

| Header          | Type   | Required | Description          |
|-----------------|--------|----------|----------------------|
| `Authorization` | String | Yes      | Bearer Access Token  |

### Responses

- **`200 OK`**: 조회 성공
    - **Body:** `ProfileResponse` 객체
    ```json
    {
      "email": "user@example.com",
      "nickname": "testuser",
      "posts": [
        {
          "id": 1,
          "title": "게시글 제목",
          "createdAt": "2023-11-28T10:00:00Z"
        }
      ],
      "comments": [
        {
          "postId": 1,
          "content": "댓글 내용",
          "postTitle": "게시글 제목",
          "createdAt": "2023-11-28T10:05:00Z"
        }
      ]
    }
    ```
- **`401 Unauthorized`**: 인증되지 않은 사용자 (토큰 누락 또는 만료)
- **`404 Not Found`**: 사용자를 찾을 수 없음

---

## 2. 내 프로필 수정

- **Endpoint:** `PATCH /api/users/me`
- **Description:** 현재 로그인된 사용자의 프로필(닉네임)을 수정합니다.
- **Content-Type:** `application/json`

### Request Headers

| Header          | Type   | Required | Description          |
|-----------------|--------|----------|----------------------|
| `Authorization` | String | Yes      | Bearer Access Token  |

### Request Body

| Field      | Type   | Constraints | Description        |
|------------|--------|-------------|--------------------|
| `nickname` | String | NotBlank    | 변경할 닉네임 (필수) |

**Example:**
```json
{
  "nickname": "new_nickname"
}
```

### Responses

- **`200 OK`**: 수정 성공 (Body 없음)
- **`400 Bad Request`**: 잘못된 요청 데이터 (예: 닉네임 공백)
- **`401 Unauthorized`**: 인증되지 않은 사용자
- **`404 Not Found`**: 사용자를 찾을 수 없음

---

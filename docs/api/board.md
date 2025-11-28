# Board API Documentation

이 문서는 서버의 게시판(Board) 관련 API를 사용하는 방법을 설명합니다. 모든 API는 인증이 필요하며, HTTP 요청 헤더에 `Authorization: Bearer <Access_Token>`을 포함해야 합니다.

---

## 1. 게시글(Posts)

### 1.1. 게시글 생성

-   **Endpoint:** `POST /api/board/posts`
-   **Description:** 새로운 게시글을 생성합니다.
-   **Content-Type:** `application/json`

#### Request Body

| Field     | Type   | Constraints | Description      |
| :-------- | :----- | :---------- | :--------------- |
| `title`   | String | NotBlank    | 게시글 제목 (필수) |
| `content` | String | NotBlank    | 게시글 내용 (필수) |

**Example:**

```json
{
  "title": "새로운 게시글 제목",
  "content": "게시글 내용입니다."
}
```

#### Responses

-   **`201 Created`**: 게시글 생성 성공. 생성된 게시글 정보를 반환합니다.
-   **`400 Bad Request`**: 요청 데이터가 유효성 검사를 통과하지 못한 경우.
-   **`401 Unauthorized`**: 인증되지 않은 사용자의 요청.

### 1.2. 게시글 목록 조회

-   **Endpoint:** `GET /api/board/posts`
-   **Description:** 게시글 목록을 페이지네이션하여 조회합니다.

#### Query Parameters

| Field     | Type    | Default | Description                                      |
| :-------- | :------ | :------ | :----------------------------------------------- |
| `page`    | integer | 0       | 조회할 페이지 번호 (0부터 시작)                  |
| `size`    | integer | 10      | 한 페이지에 보여줄 게시글 수                     |
| `sort`    | string  | N/A     | 정렬 기준 (예: `createdAt,desc` 또는 `viewCount,asc`) |

#### Responses

-   **`200 OK`**: 게시글 목록 조회 성공. `Page` 객체 형식으로 데이터를 반환합니다.
-   **`401 Unauthorized`**: 인증되지 않은 사용자의 요청.

### 1.3. 특정 게시글 조회

-   **Endpoint:** `GET /api/board/posts/{postId}`
-   **Description:** ID를 통해 특정 게시글의 상세 정보를 조회합니다.

#### Path Variables

| Field    | Type | Description        |
| :------- | :--- | :----------------- |
| `postId` | Long | 조회할 게시글의 ID |

#### Responses

-   **`200 OK`**: 게시글 조회 성공. 해당 게시글의 상세 정보를 반환합니다.
-   **`401 Unauthorized`**: 인증되지 않은 사용자의 요청.
-   **`404 Not Found`**: 해당 ID의 게시글이 존재하지 않는 경우.

### 1.4. 게시글 수정

-   **Endpoint:** `PUT /api/board/posts/{postId}`
-   **Description:** ID를 통해 특정 게시글의 제목과 내용을 수정합니다. (작성자 본인만 가능)
-   **Content-Type:** `application/json`

#### Path Variables

| Field    | Type | Description        |
| :------- | :--- | :----------------- |
| `postId` | Long | 수정할 게시글의 ID |

#### Request Body

| Field     | Type   | Constraints | Description      |
| :-------- | :----- | :---------- | :--------------- |
| `title`   | String | NotBlank    | 게시글 제목 (필수) |
| `content` | String | NotBlank    | 게시글 내용 (필수) |

#### Responses

-   **`200 OK`**: 게시글 수정 성공. 수정된 게시글 정보를 반환합니다.
-   **`401 Unauthorized`**: 인증되지 않은 사용자의 요청.
-   **`403 Forbidden`**: 수정 권한이 없는 경우.
-   **`404 Not Found`**: 해당 ID의 게시글이 존재하지 않는 경우.

### 1.5. 게시글 삭제

-   **Endpoint:** `DELETE /api/board/posts/{postId}`
-   **Description:** ID를 통해 특정 게시글을 삭제합니다. (작성자 본인만 가능)

#### Path Variables

| Field    | Type | Description        |
| :------- | :--- | :----------------- |
| `postId` | Long | 삭제할 게시글의 ID |

#### Responses

-   **`204 No Content`**: 게시글 삭제 성공.
-   **`401 Unauthorized`**: 인증되지 않은 사용자의 요청.
-   **`403 Forbidden`**: 삭제 권한이 없는 경우.
-   **`404 Not Found`**: 해당 ID의 게시글이 존재하지 않는 경우.

---

## 2. 댓글(Comments)

### 2.1. 댓글 생성

-   **Endpoint:** `POST /api/board/posts/{postId}/comments`
-   **Description:** 특정 게시글에 새로운 댓글을 생성합니다.
-   **Content-Type:** `application/json`

#### Path Variables

| Field    | Type | Description            |
| :------- | :--- | :--------------------- |
| `postId` | Long | 댓글을 작성할 게시글 ID |

#### Request Body

| Field     | Type   | Constraints | Description    |
| :-------- | :----- | :---------- | :------------- |
| `content` | String | NotBlank    | 댓글 내용 (필수) |

#### Responses

-   **`201 Created`**: 댓글 생성 성공. 생성된 댓글 정보를 반환합니다.
-   **`401 Unauthorized`**: 인증되지 않은 사용자의 요청.
-   **`404 Not Found`**: 댓글을 작성할 게시글이 존재하지 않는 경우.

### 2.2. 댓글 목록 조회

-   **Endpoint:** `GET /api/board/posts/{postId}/comments`
-   **Description:** 특정 게시글에 달린 댓글 목록을 페이지네이션하여 조회합니다.

#### Path Variables

| Field    | Type | Description            |
| :------- | :--- | :--------------------- |
| `postId` | Long | 댓글을 조회할 게시글 ID |

#### Responses

-   **`200 OK`**: 댓글 목록 조회 성공. `Page` 객체 형식으로 데이터를 반환합니다.
-   **`401 Unauthorized`**: 인증되지 않은 사용자의 요청.
-   **`404 Not Found`**: 해당 ID의 게시글이 존재하지 않는 경우.

### 2.3. 댓글 수정

-   **Endpoint:** `PUT /api/board/posts/{postId}/comments/{commentId}`
-   **Description:** 특정 댓글의 내용을 수정합니다. (작성자 본인만 가능)
-   **Content-Type:** `application/json`

#### Path Variables

| Field       | Type | Description        |
| :---------- | :--- | :----------------- |
| `postId`    | Long | 게시글의 ID        |
| `commentId` | Long | 수정할 댓글의 ID   |

#### Request Body

| Field     | Type   | Constraints | Description    |
| :-------- | :----- | :---------- | :------------- |
| `content` | String | NotBlank    | 댓글 내용 (필수) |

#### Responses

-   **`200 OK`**: 댓글 수정 성공. 수정된 댓글 정보를 반환합니다.
-   **`401 Unauthorized`**: 인증되지 않은 사용자의 요청.
-   **`403 Forbidden`**: 수정 권한이 없는 경우.
-   **`404 Not Found`**: 해당 ID의 댓글이 존재하지 않는 경우.

### 2.4. 댓글 삭제

-   **Endpoint:** `DELETE /api/board/posts/{postId}/comments/{commentId}`
-   **Description:** 특정 댓글을 삭제합니다. (작성자 본인만 가능)

#### Path Variables

| Field       | Type | Description        |
| :---------- | :--- | :----------------- |
| `postId`    | Long | 게시글의 ID        |
| `commentId` | Long | 삭제할 댓글의 ID   |

#### Responses

-   **`204 No Content`**: 댓글 삭제 성공.
-   **`401 Unauthorized`**: 인증되지 않은 사용자의 요청.
-   **`403 Forbidden`**: 삭제 권한이 없는 경우.
-   **`404 Not Found`**: 해당 ID의 댓글이 존재하지 않는 경우.

# Image API Documentation

이 문서는 서버의 이미지 분석(Image Analysis) 관련 API를 사용하는 방법을 설명합니다.

## 1. 이미지 분석

- **Endpoint:** `POST /api/images/analyze`
- **Description:** 업로드된 성적표 이미지를 AI로 분석하여 구조화된 데이터를 반환합니다.
- **Content-Type:** `multipart/form-data`

### Request Parameters

| Parameter | Type          | Required | Description      |
|-----------|---------------|----------|------------------|
| `image`   | MultipartFile | Yes      | 분석할 성적표 이미지 파일 |

### Responses

- **`200 OK`**: 분석 성공
    - **Body:** `AnalysisResultDto` 객체. 분석된 성적 데이터를 포함합니다.
    ```json
    {
      "result": {
        // AI 모델에 따라 동적으로 변경될 수 있는 분석 결과 JSON 객체
        "student_name": "홍길동",
        "student_id": "2023123456",
        "semesters": [
          {
            "year": 2023,
            "term": "1학기",
            "subjects": [
              {
                "name": "자료구조",
                "credits": 3,
                "grade": "A+"
              },
              ...
            ]
          },
          ...
        ]
      }
    }
    ```
- **`400 Bad Request`**: 잘못된 요청 (예: 파일 누락)
- **`500 Internal Server Error`**: 이미지 처리 또는 AI 분석 중 오류 발생

---

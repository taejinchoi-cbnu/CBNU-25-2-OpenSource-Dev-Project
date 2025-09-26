# 오픈소스개발프로젝트(06팀)

**06팀(서대전)**: 최태진(팀장), 이정주, 이준형
**주제**: OCR Model을 활용한 성적 시각화 서비스
**세부 내용**: 현재 개신누리에서 성적을 조회하면 표로 성적을 보여주고, 이수학점만 보여주기 때문에 성적 변화를 시각적으로 확인하기 위해선 사용자가 직접 성적 data로 시각화를 진행해야하는 단점이 존재했습니다.
또한 졸업 학점을 확인하기 위해선 성적 조회 -> 학과 홈페이지에서 졸업 요건 확인을 해야하는 불편함이 존재했습니다.
이를 개선하고자 OCR Model을 활용하여 개신누리 성적 페이지 이미지를 업로드하면 시각화 및 졸업 학점 자동 계산을 진행해주는 서비스를 기획하였습니다.

## 레포지토리 설명

- Class는 수업 실습 내용을 업로드하는 디렉토리입니다. 팀원 이름으로 디렉토리 이름이 되어 있습니다.
- docs 디렉토리는 과제, 스크럼 일지, 에자일 문서가 업로드 되어 있습니다.
  - **agile_docs**: 페이지 구조, 유저 플로우 차트, 제품 백로그가 업로드 되어 있습니다.
  - **homeworks**: 과제가 hwp 파일, pdf파일 2개로 업로드 되어 있습니다.
  - **weekly_sprint**: 팀 활동 일지가 아닌 개발을 위한 주간 스프린트 문서가 업로드 되어 있습니다.
- [점프 투 스프링부트](https://wikidocs.net/book/7601)

## 세부 디렉토리 구조

- `├── 📁 client/`: React와 TypeScript를 사용한 **프론트엔드** 애플리케이션 디렉토리입니다.
- `├── 📁 server/`: Spring Boot 기반의 **백엔드 서버** 애플리케이션 디렉토리입니다.
- `├── 📁 ocr-model/`: PaddleOCR 모델을 활용한 **AI 모델** 관련 코드 및 파일이 위치합니다.
- `├── 📁 class/`: 수업 중 진행된 실습 코드를 각 팀원의 이름으로 된 디렉토리 내에 저장합니다.
- `├── 📁 docs/`: 프로젝트 관련 문서들을 관리하는 디렉토리입니다. (과제, 주차별 스크럼 일지, 에자일 문서)

## Notion link

노션에서 프로젝트 일정 관리를 진행하고 있습니다.
(public으로 조회 가능합니다.)

- [Notion](https://www.notion.so/25-2-26578130257c803f8a5fcda3bd265ccc?source=copy_link)

## OpenSource Reference Link

### OCR Engine

- [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)
- [Korean OCR using PaddleOCR](https://github.com/yunwoong7/korean_ocr_using_paddleOCR?tab=readme-ov-file)
- [Korean OCR Tutorial](https://yunwoong.tistory.com/249)

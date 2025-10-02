# 🚀 OCR 정확도 향상 종합 마스터 플랜

## 📌 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [현황 분석](#현황-분석)
3. [개선 전략](#개선-전략)
4. [구현 계획](#구현-계획)
5. [프로젝트 구조](#프로젝트-구조)
6. [데이터베이스 구축](#데이터베이스-구축)
7. [기술적 개선 방법](#기술적-개선-방법)
8. [성능 목표](#성능-목표)

---

## 📋 프로젝트 개요

### 목표
충북대학교 성적조회 시스템의 스크린샷을 정확하게 인식하고 구조화된 데이터로 변환하는 고성능 OCR 시스템 구축

### 핵심 개선 방향
1. **정확도 향상**: 과목 데이터베이스 활용으로 85% → 95%+ 달성
2. **처리 속도 개선**: 테이블 영역만 추출하여 2-3배 속도 향상
3. **데이터 구조화**: JSON/CSV 형식으로 즉시 활용 가능한 출력

---

## 🔍 현황 분석

### 현재 문제점
- **한글 자모 인식 오류**: `탈의실` → `군티l이`, `인생을` → `|Y극가o릉`
- **과목명 오인식**: `컴퓨터구조` → `컴퓨터구초`
- **특수문자 오인식**: 한글 모음 `ㅣ`를 `|`나 `l`로 인식
- **낮은 신뢰도**: 일부 텍스트의 confidence score가 0.5-0.7 수준
- **테이블 구조 손실**: 행/열 구분 및 정렬 문제

### 기존 정확도
- 과목명 정확도: 60%
- 과목코드 인식: 70%
- 전체 테이블 정확도: 75%

---

## 🎯 개선 전략

### 1. 데이터베이스 기반 정확도 향상
- Excel 과목 데이터베이스 구축
- 퍼지 매칭 알고리즘으로 OCR 결과 보정
- 점진적 학습 시스템 구축

### 2. 지능형 영역 검출
- 테이블 영역 자동 검출
- 불필요한 UI 요소 필터링
- ROI(Region of Interest) 기반 처리

### 3. 구조화된 출력
- 테이블 구조 복원
- JSON/CSV 자동 변환
- 메타데이터 포함 (신뢰도, 처리시간)

---

## 📂 프로젝트 구조

### 권장 디렉토리 구조
```
ocr-model/
├── main.py                           # 현재 메인 스크립트
├── improved_main.py                  # 개선된 통합 스크립트
├── requirements.txt                  # 의존성 패키지
├── .gitignore                       # Git 제외 파일
├──
├── # 핵심 OCR 모듈
├── core/
│   ├── __init__.py
│   ├── ocr_engine.py                # PaddleOCR 래퍼
│   ├── preprocessor.py              # 이미지 전처리
│   ├── postprocessor.py             # 텍스트 후처리
│   ├── subject_matcher.py           # 과목 DB 매칭
│   ├── table_extractor.py           # 테이블 구조 추출
│   └── output_formatter.py          # JSON/CSV 변환
├──
├── # 데이터 및 설정
├── data/
│   ├── subject_database.xlsx        # 과목 데이터베이스
│   ├── semester_courses/             # 학기별 개설강좌
│   ├── training_data/                # 학습 데이터
│   └── templates/                    # Excel 템플릿
├──
├── # API 서버
├── api/
│   ├── ocr_server.py                # FastAPI 서버
│   ├── models.py                    # 데이터 모델
│   └── endpoints.py                 # API 엔드포인트
├──
├── # 유틸리티
├── utils/
│   ├── image_util.py                # 이미지 처리
│   ├── file_handler.py              # 파일 입출력
│   └── validators.py                # 데이터 검증
├──
├── # 테스트
├── tests/
│   ├── test_ocr_engine.py
│   ├── test_preprocessor.py
│   └── fixtures/                    # 테스트 데이터
└──
└── # 로그 및 캐시
    ├── logs/
    └── cache/
```

---

## 💾 데이터베이스 구축

### 1. 실제 개설강좌 데이터 활용 (2025-01학기 소프트웨어학부)
현재 보유한 **"개설강좌 목록-2025-01학기-소프트웨어학부.xlsx"** 파일을 기반으로 과목 데이터베이스를 구축합니다.

#### 예상 데이터 구조
```excel
과목코드    | 과목명           | 영문명                  | 학과        | 학년 | 학점 | 교수명 | 시간표 | 별명/약칭
5118020    | 컴퓨터구조       | Computer Architecture  | 컴퓨터공학   | 2    | 3    | 김교수 | 월3,4  | 컴구,컴퓨터구조학
5120001    | 오픈소스플랫폼   | Open Source Platform   | 컴퓨터공학   | 3    | 3    | 이교수 | 화2,3  | 오픈소스,OSP
5120003    | 운영체제         | Operating System       | 컴퓨터공학   | 3    | 3    | 박교수 | 목5,6  | OS,운체
0914002    | 기초컴퓨터프로그래밍 | Basic Programming   | 컴퓨터공학   | 1    | 3    | 최교수 | 금1,2  | 기프,기초프로그래밍
```

#### 개설강좌 Excel 파일 활용 전략
1. **직접 활용**: 실제 개설강좌 데이터를 그대로 과목 DB로 사용
2. **자동 별명 생성**: 과목명 패턴 분석으로 약칭 자동 생성
3. **교수명 매칭**: 성적표의 교수명과 교차 검증으로 정확도 향상
4. **시간표 정보**: 추가 검증 데이터로 활용

### 2. 개설강좌 파일 처리 방법

#### 개설강좌 데이터 로드 및 전처리
```python
def load_semester_courses(file_path="개설강좌 목록-2025-01학기-소프트웨어학부.xlsx"):
    """실제 개설강좌 Excel 파일 로드 및 전처리"""
    import pandas as pd

    # Excel 파일 로드
    df = pd.read_excel(file_path)

    # 컬럼명 표준화 (실제 컬럼명에 맞게 조정 필요)
    column_mapping = {
        '교과목번호': '과목코드',
        '교과목명': '과목명',
        '담당교수': '교수명',
        '학점': '학점',
        '요일및강의시간': '시간표',
        '강의실': '강의실'
    }
    df = df.rename(columns=column_mapping)

    # 자동 별명 생성
    df['별명/약칭'] = df['과목명'].apply(generate_subject_aliases)

    # 과목 DB로 저장
    df.to_excel('data/subject_database_2025_1.xlsx', index=False)
    return df

def generate_subject_aliases(subject_name):
    """과목명에서 자동으로 별명/약칭 생성"""
    aliases = []

    # 일반적인 약칭 패턴
    patterns = {
        '프로그래밍': ['프로그래밍', '프밍'],
        '컴퓨터': ['컴퓨터', '컴'],
        '데이터베이스': ['데이터베이스', 'DB', '데베'],
        '운영체제': ['운영체제', 'OS', '운체'],
        '네트워크': ['네트워크', '네트', '넷'],
        '알고리즘': ['알고리즘', '알고'],
        '인공지능': ['인공지능', 'AI', '인지'],
        '소프트웨어': ['소프트웨어', 'SW', '소웨'],
        '시스템': ['시스템', '시스'],
    }

    for key, values in patterns.items():
        if key in subject_name:
            aliases.extend(values)

    # 첫 글자 약어 생성 (예: 컴퓨터구조 → 컴구)
    words = subject_name.split()
    if len(words) >= 2:
        abbreviation = ''.join([word[0] for word in words if len(word) > 1])
        if len(abbreviation) >= 2:
            aliases.append(abbreviation)

    return ','.join(set(aliases))
```

### 3. 개설강좌 기반 향상된 매칭 시스템

```python
class EnhancedSubjectMatcher:
    def __init__(self, semester_file="개설강좌 목록-2025-01학기-소프트웨어학부.xlsx"):
        """개설강좌 파일 기반 매칭 시스템"""
        self.df = self.load_and_process_courses(semester_file)
        self.subject_dict = self._build_subject_dict()
        self.professor_dict = self._build_professor_dict()

    def load_and_process_courses(self, file_path):
        """개설강좌 파일 로드 및 처리"""
        df = pd.read_excel(file_path)
        # 별명 자동 생성
        df['별명/약칭'] = df['과목명'].apply(generate_subject_aliases)
        return df

    def _build_professor_dict(self):
        """교수명-과목 매핑 사전 구축"""
        prof_dict = {}
        for _, row in self.df.iterrows():
            if pd.notna(row.get('교수명')):
                prof_name = str(row['교수명']).strip()
                if prof_name not in prof_dict:
                    prof_dict[prof_name] = []
                prof_dict[prof_name].append(row['과목명'])
        return prof_dict

    def find_best_match_with_context(self, ocr_text, professor_name=None, threshold=70):
        """컨텍스트(교수명)를 활용한 향상된 매칭"""

        # 1. 교수명이 있는 경우 해당 교수의 과목 우선 매칭
        if professor_name and professor_name in self.professor_dict:
            professor_subjects = self.professor_dict[professor_name]
            from fuzzywuzzy import process
            best_match = process.extractOne(ocr_text, professor_subjects, scorer=fuzz.ratio)
            if best_match and best_match[1] >= threshold - 10:  # 교수명 일치시 임계값 완화
                return best_match[0], best_match[1] + 5  # 신뢰도 보너스

        # 2. 일반 매칭으로 폴백
        return self.find_best_match(ocr_text, threshold)

    def validate_with_multiple_fields(self, ocr_results):
        """여러 필드를 교차 검증하여 정확도 향상"""
        validated_results = []

        for row in ocr_results:
            # 과목코드, 과목명, 교수명, 학점 등 여러 필드 동시 검증
            subject_code = row.get('과목코드', '')
            subject_name = row.get('과목명', '')
            professor = row.get('교수명', '')
            credits = row.get('학점', '')

            # 데이터베이스와 교차 검증
            db_match = self.df[
                (self.df['과목코드'] == subject_code) |
                (self.df['과목명'].str.contains(subject_name, na=False))
            ]

            if not db_match.empty:
                # DB에서 찾은 정확한 정보로 교체
                validated_row = {
                    '과목코드': db_match.iloc[0]['과목코드'],
                    '과목명': db_match.iloc[0]['과목명'],
                    '교수명': db_match.iloc[0].get('교수명', professor),
                    '학점': db_match.iloc[0].get('학점', credits),
                    '신뢰도': 0.95
                }
            else:
                validated_row = row
                validated_row['신뢰도'] = 0.6

            validated_results.append(validated_row)

        return validated_results
```

### 4. 점진적 학습 시스템

```python
class OCRLearningSystem:
    def __init__(self):
        self.corrections_path = "data/training_data/ocr_corrections.xlsx"
        self.load_corrections()

    def add_correction(self, ocr_text, correct_text, confidence):
        """새로운 오류-정답 매핑 추가 및 학습"""
        # 빈도 기반 자동 학습
        if self.get_frequency(ocr_text, correct_text) >= 3:
            self.update_database(ocr_text, correct_text)
```

---

## 🔧 기술적 개선 방법

### 1. 이미지 전처리 파이프라인

#### 웹 스크린샷 전용 전처리
```python
def preprocess_web_screenshot(img):
    """성적조회 화면 전용 전처리"""
    # 1. 색상 반전 (다크모드 → 라이트모드)
    img = cv2.bitwise_not(img)

    # 2. 고해상도 확대 (2000px 이상)
    height, width = img.shape[:2]
    if width < 2000:
        scale = 2000 / width
        new_size = (int(width * scale), int(height * scale))
        img = cv2.resize(img, new_size, interpolation=cv2.INTER_LANCZOS4)

    # 3. CLAHE 대비 향상
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    if len(img.shape) == 2:
        img = clahe.apply(img)

    # 4. 샤프닝
    kernel = np.array([[-1,-1,-1],
                       [-1, 9,-1],
                       [-1,-1,-1]])
    img = cv2.filter2D(img, -1, kernel)

    return img
```

### 2. 테이블 영역 검출

```python
def detect_table_region(img):
    """테이블 영역 자동 검출"""
    # 엣지 검출
    edges = cv2.Canny(img, 50, 150)

    # 컨투어 찾기
    contours, _ = cv2.findContours(edges,
                                   cv2.RETR_EXTERNAL,
                                   cv2.CHAIN_APPROX_SIMPLE)

    # 최대 사각형 영역 찾기
    max_area = 0
    table_region = None

    for contour in contours:
        area = cv2.contourArea(contour)
        if area > max_area:
            x, y, w, h = cv2.boundingRect(contour)
            if w > img.shape[1] * 0.5 and h > img.shape[0] * 0.3:
                max_area = area
                table_region = (x, y, w, h)

    return table_region
```

### 3. PaddleOCR 최적화 설정

```python
def create_optimized_ocr():
    """최적화된 OCR 인스턴스 생성"""
    return PaddleOCR(
        lang='korean',
        use_angle_cls=False,        # 웹 스크린샷은 항상 수평
        use_gpu=True,               # GPU 가속

        # 검출 파라미터
        det_db_thresh=0.2,          # 낮은 임계값으로 작은 텍스트도 검출
        det_db_box_thresh=0.3,
        det_limit_side_len=1960,    # 큰 이미지 허용

        # 인식 파라미터
        rec_batch_num=50,           # 큰 배치 크기
        max_text_length=50,         # 긴 텍스트 허용
        drop_score=0.2,             # 낮은 스코어도 포함
        use_space_char=True,

        # 모델 선택
        rec_algorithm='SVTR_LCNet'  # PP-OCRv4
    )
```

### 4. 테이블 구조 복원

```python
def extract_table_structure(ocr_results):
    """OCR 결과를 테이블 구조로 변환"""
    # Y 좌표로 행 그룹핑
    rows = []
    current_row = []
    last_y = -1

    for result in sorted(ocr_results, key=lambda x: x[0][0][1]):
        y = result[0][0][1]
        if last_y != -1 and abs(y - last_y) > 30:
            rows.append(sorted(current_row, key=lambda x: x[0][0][0]))
            current_row = []
        current_row.append(result)
        last_y = y

    if current_row:
        rows.append(sorted(current_row, key=lambda x: x[0][0][0]))

    # 헤더와 데이터 분리
    headers = [cell[1][0] for cell in rows[0]] if rows else []
    data_rows = []

    for row in rows[1:]:
        row_data = {}
        for i, cell in enumerate(row):
            if i < len(headers):
                row_data[headers[i]] = cell[1][0]
        data_rows.append(row_data)

    return {"headers": headers, "data": data_rows}
```

### 5. 출력 포맷터

```python
class OutputFormatter:
    @staticmethod
    def to_json(table_data, metadata=None):
        """JSON 형식으로 변환"""
        output = {
            "timestamp": datetime.now().isoformat(),
            "table": table_data,
            "metadata": metadata or {}
        }
        return json.dumps(output, ensure_ascii=False, indent=2)

    @staticmethod
    def to_csv(table_data):
        """CSV 형식으로 변환"""
        df = pd.DataFrame(table_data["data"])
        return df.to_csv(index=False, encoding='utf-8-sig')
```

---

## 📊 구현 로드맵

### Phase 1: 기초 구축 (Day 1-2)
- [x] 프로젝트 구조 설정
- [x] 개설강좌 Excel 파일 확보 (2025-01학기 소프트웨어학부)
- [ ] 개설강좌 데이터를 과목 DB로 변환
- [ ] 자동 별명/약칭 생성 시스템 구현

### Phase 2: 핵심 모듈 개발 (Day 3-5)
- [ ] `core/subject_matcher.py` - 과목 매칭 시스템
- [ ] `core/table_extractor.py` - 테이블 검출
- [ ] `core/preprocessor.py` - 이미지 전처리
- [ ] `core/postprocessor.py` - 텍스트 후처리

### Phase 3: 학습 시스템 (Day 6-7)
- [ ] 템플릿 이미지 수집 및 학습
- [ ] 사용자 피드백 시스템
- [ ] 자동 개선 파이프라인

### Phase 4: 통합 및 최적화 (Day 8)
- [ ] `improved_main.py` 작성
- [ ] API 서버 구축
- [ ] 성능 테스트 및 벤치마크

---

## 🎯 성능 목표

### 정확도 개선 (개설강좌 DB 활용)
| 항목 | 현재 | 목표 | 개선 방법 |
|------|------|------|----------|
| 과목명 인식 | 60% | **95%+** | 개설강좌 DB 직접 매칭 |
| 과목코드 인식 | 70% | **98%+** | 7자리 패턴 + DB 검증 |
| 교수명 인식 | 50% | **90%+** | 개설강좌 교수명 교차 검증 |
| 테이블 구조 | 75% | **95%+** | 템플릿 매칭 + 구조 분석 |
| 전체 정확도 | 68% | **95%+** | 다중 필드 교차 검증 |

### 처리 속도
- 현재: 이미지당 3-5초
- 목표: 이미지당 1-2초 (테이블 영역만 처리)

### 출력 품질
- 구조화된 JSON/CSV 출력
- 메타데이터 포함 (신뢰도, 처리시간)
- 즉시 활용 가능한 데이터 형식

---

## 🚀 빠른 시작 가이드

### 1. 환경 설정
```bash
# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
```

### 2. 데이터베이스 구축
```bash
# 개설강좌 파일을 data 폴더로 복사
mkdir -p data/semester_courses
cp "개설강좌 목록-2025-01학기-소프트웨어학부.xlsx" data/semester_courses/

# 과목 DB 자동 생성
python -c "
from core.subject_matcher import EnhancedSubjectMatcher
matcher = EnhancedSubjectMatcher('data/semester_courses/개설강좌 목록-2025-01학기-소프트웨어학부.xlsx')
print(f'과목 DB 생성 완료: {len(matcher.df)}개 과목')
"
```

### 3. OCR 실행
```python
from improved_main import ImprovedOCR

# 개설강좌 파일 기반 OCR 인스턴스 생성
ocr = ImprovedOCR(
    semester_file="data/semester_courses/개설강좌 목록-2025-01학기-소프트웨어학부.xlsx",
    output_format="json"
)

# 이미지 처리 (성적조회 스크린샷)
result = ocr.process_image("assets/images/main_test_1.png")

# 개설강좌 정보와 교차 검증
validated_result = ocr.validate_with_semester_data(result)

# 결과 저장 (JSON/CSV)
ocr.save_results(validated_result, "output/grades_2025_1.json")
ocr.save_as_csv(validated_result, "output/grades_2025_1.csv")
```

---

## 📝 유지보수 가이드

### 데이터베이스 업데이트
1. **새 학기 개설강좌 추가**:
   - 매 학기 개설강좌 Excel 파일 다운로드
   - `data/semester_courses/` 폴더에 저장
   - 파일명 형식: `개설강좌 목록-YYYY-N학기-학부명.xlsx`

2. **자동 DB 업데이트 스크립트**:
```python
# scripts/update_semester_db.py
import os
from glob import glob

def update_all_semester_databases():
    """모든 개설강좌 파일을 통합 DB로 변환"""
    files = glob("data/semester_courses/*.xlsx")
    for file in files:
        print(f"Processing: {file}")
        # 각 파일 처리 및 통합
```

3. **OCR 오류 자동 학습**:
   - 사용자 수정 내역 자동 수집
   - 빈도 3회 이상시 DB 자동 업데이트

### 성능 모니터링
```python
# 일일 성능 체크
python scripts/daily_performance_check.py

# 벤치마크 실행
python scripts/benchmark.py --test-images ./test_data/
```

### 트러블슈팅
- **낮은 정확도**: 이미지 전처리 파라미터 조정
- **느린 처리**: GPU 사용 확인, 배치 크기 조정
- **메모리 부족**: 이미지 크기 제한, 캐시 정리

---

## 🔗 참고 자료
- [PaddleOCR 공식 문서](https://github.com/PaddlePaddle/PaddleOCR)
- [OpenCV 이미지 전처리](https://docs.opencv.org/4.x/)
- [FastAPI 문서](https://fastapi.tiangolo.com/)

---

*이 문서는 OCR_ACCURACY_TROUBLESHOOTING.md, PROJECT_STRUCTURE_GUIDE.md, SUBJECT_DATABASE_GUIDE.md를 통합하여 작성되었습니다.*
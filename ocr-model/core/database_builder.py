"""
통합 과목 데이터베이스 구축 시스템
24-25년도 4개 학기 개설강좌 데이터를 통합하여 고성능 OCR 매칭 DB 생성
"""

import pandas as pd
import os
import re
from glob import glob
from typing import Dict, List, Tuple
from datetime import datetime
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class DatabaseBuilder:
    """통합 과목 데이터베이스 구축기"""

    def __init__(self, data_dir: str = "data/semester_courses"):
        self.data_dir = data_dir
        self.integrated_db = None
        self.alias_patterns = {}
        self.professor_mapping = {}

    def load_all_semesters(self) -> Dict[str, pd.DataFrame]:
        """모든 학기 Excel 파일 로드"""
        excel_files = glob(os.path.join(self.data_dir, "*.xlsx"))
        logger.info(f"발견된 Excel 파일: {len(excel_files)}개")

        semester_data = {}

        for file_path in excel_files:
            # 파일명에서 학기 정보 추출
            filename = os.path.basename(file_path)
            semester_match = re.search(r'(\d{4})-(\d{2})학기', filename)

            if semester_match:
                year, semester = semester_match.groups()
                semester_key = f"{year}-{semester}"

                try:
                    df = pd.read_excel(file_path)
                    df = self._standardize_columns(df)
                    semester_data[semester_key] = df
                    logger.info(f"{semester_key} 학기 로드 완료: {len(df)}개 과목")
                except Exception as e:
                    logger.error(f"{file_path} 로드 실패: {e}")
            else:
                logger.warning(f"학기 정보를 추출할 수 없는 파일: {filename}")

        return semester_data

    def _standardize_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """컬럼명 표준화"""
        # 다양한 컬럼명 패턴을 표준화
        column_mapping = {
            '교과목번호': '과목코드',
            '과목번호': '과목코드',
            '교과목명': '과목명',
            '과목명': '과목명',
            '담당교수': '교수명',
            '교수명': '교수명',
            '교수': '교수명',
            '학점': '학점',
            '요일및강의시간': '시간표',
            '시간표': '시간표',
            '강의시간': '시간표',
            '강의실': '강의실',
            '교실': '강의실',
            '이수구분': '이수구분',
            '구분': '이수구분'
        }

        # 실제 컬럼명 확인 후 매핑
        for old_col, new_col in column_mapping.items():
            if old_col in df.columns:
                df = df.rename(columns={old_col: new_col})

        # 필수 컬럼이 없으면 빈 컬럼 생성
        required_columns = ['과목코드', '과목명', '교수명', '학점', '시간표', '강의실']
        for col in required_columns:
            if col not in df.columns:
                df[col] = ''

        return df

    def build_integrated_database(self) -> pd.DataFrame:
        """통합 데이터베이스 구축"""
        semester_data = self.load_all_semesters()

        if not semester_data:
            logger.error("로드된 학기 데이터가 없습니다")
            return pd.DataFrame()

        # 모든 학기 데이터 병합
        all_courses = []

        for semester, df in semester_data.items():
            df_copy = df.copy()
            df_copy['학기'] = semester
            df_copy['등록일시'] = datetime.now()
            all_courses.append(df_copy)

        combined_df = pd.concat(all_courses, ignore_index=True)
        logger.info(f"전체 통합 데이터: {len(combined_df)}개 레코드")

        # 중복 제거 및 정규화
        self.integrated_db = self._normalize_database(combined_df)

        # 별명/약칭 자동 생성
        self.integrated_db['별명/약칭'] = self.integrated_db['과목명'].apply(self.generate_subject_aliases)

        # 교수-과목 매핑 구축
        self._build_professor_mapping()

        # 통합 DB 저장
        output_path = "data/integrated_subject_database.xlsx"
        self.integrated_db.to_excel(output_path, index=False)
        logger.info(f"통합 데이터베이스 저장 완료: {output_path}")

        return self.integrated_db

    def _normalize_database(self, df: pd.DataFrame) -> pd.DataFrame:
        """데이터 정규화 및 중복 제거"""

        # 1. 데이터 정제
        df['과목코드'] = df['과목코드'].astype(str).str.strip()
        df['과목명'] = df['과목명'].astype(str).str.strip()
        df['교수명'] = df['교수명'].astype(str).str.strip()

        # 2. 과목코드 기준 중복 제거 (최신 학기 우선)
        df = df.sort_values(['학기'], ascending=False)
        df_unique = df.drop_duplicates(subset=['과목코드'], keep='first')

        # 3. 과목명 기준 유사 과목 통합
        df_unique = self._merge_similar_subjects(df_unique)

        logger.info(f"정규화 후 데이터: {len(df_unique)}개 과목")
        return df_unique

    def _merge_similar_subjects(self, df: pd.DataFrame) -> pd.DataFrame:
        """유사한 과목명 통합"""
        # 과목명 정규화 (공백, 특수문자 제거)
        df['정규화_과목명'] = df['과목명'].str.replace(r'[\s\-\(\)]', '', regex=True)

        # 정규화된 과목명 기준으로 중복 제거
        df = df.drop_duplicates(subset=['정규화_과목명'], keep='first')
        df = df.drop(columns=['정규화_과목명'])

        return df

    def generate_subject_aliases(self, subject_name: str) -> str:
        """과목명에서 자동으로 별명/약칭 생성"""
        if pd.isna(subject_name) or not subject_name.strip():
            return ""

        aliases = []

        # 1. 일반적인 약칭 패턴
        patterns = {
            '프로그래밍': ['프로그래밍', '프밍', '프로그래밍'],
            '컴퓨터': ['컴퓨터', '컴'],
            '데이터베이스': ['데이터베이스', 'DB', '데베', '디비'],
            '운영체제': ['운영체제', 'OS', '운체'],
            '네트워크': ['네트워크', '네트', '넷워크'],
            '알고리즘': ['알고리즘', '알고'],
            '인공지능': ['인공지능', 'AI', '인지'],
            '소프트웨어': ['소프트웨어', 'SW', '소웨'],
            '시스템': ['시스템', '시스'],
            '구조': ['구조', '구'],
            '설계': ['설계', '설'],
            '분석': ['분석', '분'],
            '개론': ['개론', '개'],
            '공학': ['공학', '공'],
            '수학': ['수학', '수'],
            '물리': ['물리', '물'],
            '화학': ['화학', '화'],
            '영어': ['영어', '영'],
            '한국어': ['한국어', '한'],
            '중국어': ['중국어', '중'],
            '일본어': ['일본어', '일'],
        }

        for key, values in patterns.items():
            if key in subject_name:
                aliases.extend(values)

        # 2. 첫 글자 약어 생성 (예: 컴퓨터구조 → 컴구)
        words = subject_name.replace(' ', '').replace('-', '')
        if len(words) >= 4:
            # 2글자씩 묶어서 약어 생성
            abbreviation = words[0] + words[len(words)//2]
            aliases.append(abbreviation)

            # 첫글자와 마지막글자
            if len(words) >= 3:
                aliases.append(words[0] + words[-1])

        # 3. 숫자가 포함된 경우
        if re.search(r'\d', subject_name):
            # 숫자 제거 버전
            no_digit_version = re.sub(r'\d', '', subject_name).strip()
            if no_digit_version:
                aliases.append(no_digit_version)

        # 4. 영어 단어 포함된 경우
        english_words = re.findall(r'[A-Za-z]+', subject_name)
        for word in english_words:
            if len(word) >= 2:
                aliases.append(word.upper())

        # 중복 제거 및 원본 과목명 제외
        aliases = list(set(aliases))
        if subject_name in aliases:
            aliases.remove(subject_name)

        return ','.join(aliases)

    def _build_professor_mapping(self):
        """교수-과목 매핑 구축"""
        if self.integrated_db is None:
            return

        for _, row in self.integrated_db.iterrows():
            prof_name = str(row.get('교수명', '')).strip()
            subject_name = str(row.get('과목명', '')).strip()

            if prof_name and prof_name != 'nan' and subject_name:
                if prof_name not in self.professor_mapping:
                    self.professor_mapping[prof_name] = []

                if subject_name not in self.professor_mapping[prof_name]:
                    self.professor_mapping[prof_name].append(subject_name)

        logger.info(f"교수-과목 매핑 구축 완료: {len(self.professor_mapping)}명 교수")

    def get_subject_variations(self, subject_name: str) -> List[str]:
        """특정 과목의 모든 변형 가져오기"""
        if self.integrated_db is None:
            return [subject_name]

        variations = [subject_name]

        # DB에서 유사한 과목명 찾기
        similar_subjects = self.integrated_db[
            self.integrated_db['과목명'].str.contains(subject_name, na=False)
        ]['과목명'].tolist()

        variations.extend(similar_subjects)

        # 별명/약칭에서 찾기
        for _, row in self.integrated_db.iterrows():
            aliases = str(row.get('별명/약칭', ''))
            if subject_name in aliases:
                variations.append(row['과목명'])
                variations.extend(aliases.split(','))

        return list(set(variations))

    def get_professor_subjects(self, professor_name: str) -> List[str]:
        """특정 교수의 담당 과목 목록"""
        return self.professor_mapping.get(professor_name, [])

    def save_training_templates(self):
        """학습용 템플릿 파일 생성"""
        if self.integrated_db is None:
            logger.error("통합 DB가 생성되지 않았습니다")
            return

        # 1. 과목명 별명 템플릿
        alias_template = self.integrated_db[['과목명', '별명/약칭']].copy()
        alias_template.to_excel('data/templates/subject_aliases_template.xlsx', index=False)

        # 2. 교수-과목 매핑 템플릿
        prof_mapping_data = []
        for prof, subjects in self.professor_mapping.items():
            for subject in subjects:
                prof_mapping_data.append({'교수명': prof, '과목명': subject})

        prof_df = pd.DataFrame(prof_mapping_data)
        prof_df.to_excel('data/templates/professor_subject_mapping.xlsx', index=False)

        # 3. 과목 통계 템플릿
        stats_data = {
            '총_과목수': len(self.integrated_db),
            '총_교수수': len(self.professor_mapping),
            '평균_별명수': self.integrated_db['별명/약칭'].str.split(',').str.len().mean(),
            '생성일시': datetime.now().isoformat()
        }

        stats_df = pd.DataFrame([stats_data])
        stats_df.to_excel('data/templates/database_statistics.xlsx', index=False)

        logger.info("학습 템플릿 파일 생성 완료")

    def get_database_info(self) -> Dict:
        """데이터베이스 정보 반환"""
        if self.integrated_db is None:
            return {}

        return {
            'total_subjects': len(self.integrated_db),
            'total_professors': len(self.professor_mapping),
            'unique_codes': self.integrated_db['과목코드'].nunique(),
            'semesters': sorted(self.integrated_db['학기'].unique()),
            'most_common_subjects': self.integrated_db['과목명'].value_counts().head(10).to_dict()
        }


def main():
    """메인 실행 함수"""
    print("=" * 60)
    print("📚 통합 과목 데이터베이스 구축 시작")
    print("=" * 60)

    # 데이터베이스 빌더 생성
    db_builder = DatabaseBuilder()

    # 통합 데이터베이스 구축
    integrated_db = db_builder.build_integrated_database()

    if integrated_db.empty:
        print("❌ 데이터베이스 구축 실패")
        return

    # 학습 템플릿 생성
    db_builder.save_training_templates()

    # 결과 출력
    info = db_builder.get_database_info()
    print(f"\n✅ 통합 데이터베이스 구축 완료!")
    print(f"📊 총 과목 수: {info['total_subjects']}")
    print(f"👨‍🏫 총 교수 수: {info['total_professors']}")
    print(f"🔢 고유 과목 코드: {info['unique_codes']}")
    print(f"📅 포함 학기: {', '.join(info['semesters'])}")

    print(f"\n📈 주요 과목 (상위 5개):")
    for subject, count in list(info['most_common_subjects'].items())[:5]:
        print(f"  • {subject}: {count}회")

    print(f"\n💾 생성된 파일:")
    print(f"  • data/integrated_subject_database.xlsx")
    print(f"  • data/templates/subject_aliases_template.xlsx")
    print(f"  • data/templates/professor_subject_mapping.xlsx")
    print(f"  • data/templates/database_statistics.xlsx")

    print("=" * 60)


if __name__ == "__main__":
    main()
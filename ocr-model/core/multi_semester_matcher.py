"""
다중 학기 통합 과목 매칭 시스템
24-25년도 4개 학기 데이터를 활용한 고정확도 OCR 결과 매칭
"""

import pandas as pd
import numpy as np
import re
from typing import Dict, List, Tuple, Optional
from difflib import SequenceMatcher
import logging

try:
    from fuzzywuzzy import fuzz, process
    FUZZYWUZZY_AVAILABLE = True
except ImportError:
    FUZZYWUZZY_AVAILABLE = False
    logging.warning("fuzzywuzzy 패키지가 설치되지 않아 기본 매칭 알고리즘을 사용합니다.")

from .database_builder import DatabaseBuilder
from .pattern_generator import PatternGenerator

logger = logging.getLogger(__name__)


class MultiSemesterMatcher:
    """다중 학기 통합 매칭 시스템"""

    def __init__(self, db_path: str = "data/integrated_subject_database.xlsx"):
        """
        Args:
            db_path: 통합 데이터베이스 경로
        """
        self.db_path = db_path
        self.df = None
        self.subject_dict = {}
        self.professor_dict = {}
        self.code_dict = {}
        self.alias_dict = {}

        self.load_database()
        self._build_lookup_dicts()

    def load_database(self):
        """통합 데이터베이스 로드"""
        try:
            if self.db_path.endswith('.xlsx'):
                self.df = pd.read_excel(self.db_path)
            else:
                # 만약 DB가 없으면 새로 생성
                logger.info("통합 DB가 없어 새로 생성합니다...")
                db_builder = DatabaseBuilder()
                self.df = db_builder.build_integrated_database()

            logger.info(f"통합 DB 로드 완료: {len(self.df)}개 과목")

        except Exception as e:
            logger.error(f"데이터베이스 로드 실패: {e}")
            self.df = pd.DataFrame()

    def _build_lookup_dicts(self):
        """빠른 검색을 위한 사전 구축"""
        if self.df.empty:
            return

        for _, row in self.df.iterrows():
            subject_code = str(row.get('과목코드', '')).strip()
            subject_name = str(row.get('과목명', '')).strip()
            professor = str(row.get('교수명', '')).strip()
            aliases = str(row.get('별명/약칭', '')).strip()

            # 과목명 사전
            if subject_name:
                self.subject_dict[subject_name] = row.to_dict()

            # 과목코드 사전
            if subject_code and subject_code != 'nan':
                self.code_dict[subject_code] = subject_name

            # 교수명 사전
            if professor and professor != 'nan':
                if professor not in self.professor_dict:
                    self.professor_dict[professor] = []
                self.professor_dict[professor].append(subject_name)

            # 별명 사전
            if aliases and aliases != 'nan':
                for alias in aliases.split(','):
                    alias = alias.strip()
                    if alias:
                        self.alias_dict[alias] = subject_name

        logger.info(f"검색 사전 구축 완료: 과목 {len(self.subject_dict)}, 교수 {len(self.professor_dict)}, 별명 {len(self.alias_dict)}")

    def find_best_match(self, ocr_text: str, context: Dict = None, threshold: float = 70) -> Tuple[str, float, str]:
        """
        OCR 텍스트에 대한 최적 매칭 찾기

        Args:
            ocr_text: OCR 인식 결과
            context: 추가 컨텍스트 (교수명, 과목코드 등)
            threshold: 최소 매칭 임계값

        Returns:
            Tuple[str, float, str]: (매칭된 과목명, 신뢰도, 매칭 방법)
        """
        if not ocr_text or not ocr_text.strip():
            return ocr_text, 0.0, "empty_input"

        ocr_text = ocr_text.strip()

        # 1. 정확한 매칭 (100% 신뢰도)
        exact_match = self._exact_match(ocr_text)
        if exact_match:
            return exact_match, 100.0, "exact_match"

        # 2. 과목코드 패턴 매칭 (95% 신뢰도)
        code_match = self._code_pattern_match(ocr_text)
        if code_match:
            return code_match, 95.0, "code_pattern"

        # 3. 컨텍스트 기반 매칭 (교수명 활용)
        if context and context.get('교수명'):
            context_match = self._context_based_match(ocr_text, context, threshold - 10)
            if context_match[1] > 0:
                return context_match[0], context_match[1] + 5, "context_match"

        # 4. 퍼지 매칭
        fuzzy_match = self._fuzzy_match(ocr_text, threshold)
        if fuzzy_match[1] >= threshold:
            return fuzzy_match[0], fuzzy_match[1], "fuzzy_match"

        # 5. 부분 매칭
        partial_match = self._partial_match(ocr_text, threshold - 20)
        if partial_match[1] >= threshold - 20:
            return partial_match[0], partial_match[1], "partial_match"

        # 6. 패턴 기반 보정 매칭
        pattern_match = self._pattern_based_match(ocr_text, threshold - 30)
        if pattern_match[1] >= threshold - 30:
            return pattern_match[0], pattern_match[1], "pattern_match"

        return ocr_text, 0.0, "no_match"

    def _exact_match(self, ocr_text: str) -> Optional[str]:
        """정확한 매칭"""
        # 과목명 직접 매칭
        if ocr_text in self.subject_dict:
            return ocr_text

        # 별명 매칭
        if ocr_text in self.alias_dict:
            return self.alias_dict[ocr_text]

        # 과목코드 매칭
        if ocr_text in self.code_dict:
            return self.code_dict[ocr_text]

        return None

    def _code_pattern_match(self, ocr_text: str) -> Optional[str]:
        """과목코드 패턴 매칭"""
        # 7자리 숫자 패턴 찾기
        code_match = re.search(r'\b\d{7}\b', ocr_text)
        if code_match:
            code = code_match.group()
            if code in self.code_dict:
                return self.code_dict[code]

        # OCR 오류를 고려한 코드 매칭 (O->0, l->1 등)
        corrected_text = ocr_text
        corrections = {'O': '0', 'o': '0', 'l': '1', 'I': '1', 'S': '5', 'B': '8'}

        for wrong, correct in corrections.items():
            corrected_text = corrected_text.replace(wrong, correct)

        code_match = re.search(r'\b\d{7}\b', corrected_text)
        if code_match:
            code = code_match.group()
            if code in self.code_dict:
                return self.code_dict[code]

        return None

    def _context_based_match(self, ocr_text: str, context: Dict, threshold: float) -> Tuple[str, float]:
        """컨텍스트 기반 매칭"""
        professor = context.get('교수명', '')

        if professor in self.professor_dict:
            professor_subjects = self.professor_dict[professor]

            # 해당 교수의 과목 중에서 가장 유사한 것 찾기
            best_match = ""
            best_score = 0.0

            for subject in professor_subjects:
                if FUZZYWUZZY_AVAILABLE:
                    score = fuzz.ratio(ocr_text, subject)
                else:
                    score = self._simple_similarity(ocr_text, subject) * 100

                if score > best_score:
                    best_score = score
                    best_match = subject

            if best_score >= threshold:
                return best_match, best_score

        return ocr_text, 0.0

    def _fuzzy_match(self, ocr_text: str, threshold: float) -> Tuple[str, float]:
        """퍼지 매칭"""
        if FUZZYWUZZY_AVAILABLE:
            # fuzzywuzzy 사용
            subjects = list(self.subject_dict.keys())
            result = process.extractOne(ocr_text, subjects, scorer=fuzz.ratio)

            if result and result[1] >= threshold:
                return result[0], result[1]
        else:
            # 간단한 유사도 계산
            best_match = ""
            best_score = 0.0

            for subject in self.subject_dict.keys():
                score = self._simple_similarity(ocr_text, subject) * 100
                if score > best_score:
                    best_score = score
                    best_match = subject

            if best_score >= threshold:
                return best_match, best_score

        return ocr_text, 0.0

    def _partial_match(self, ocr_text: str, threshold: float) -> Tuple[str, float]:
        """부분 매칭"""
        best_match = ""
        best_score = 0.0

        for subject in self.subject_dict.keys():
            # 부분 문자열 매칭
            if len(ocr_text) >= 2 and len(subject) >= 2:
                # OCR 결과가 과목명에 포함되는 경우
                if ocr_text in subject:
                    score = (len(ocr_text) / len(subject)) * 80
                    if score > best_score:
                        best_score = score
                        best_match = subject

                # 과목명이 OCR 결과에 포함되는 경우
                elif subject in ocr_text:
                    score = (len(subject) / len(ocr_text)) * 75
                    if score > best_score:
                        best_score = score
                        best_match = subject

        if best_score >= threshold:
            return best_match, best_score

        return ocr_text, 0.0

    def _pattern_based_match(self, ocr_text: str, threshold: float) -> Tuple[str, float]:
        """패턴 기반 보정 매칭"""
        # 일반적인 OCR 오류 패턴 보정
        corrected_text = self._apply_ocr_corrections(ocr_text)

        if corrected_text != ocr_text:
            # 보정된 텍스트로 다시 매칭 시도
            exact_match = self._exact_match(corrected_text)
            if exact_match:
                return exact_match, 85.0

            fuzzy_match = self._fuzzy_match(corrected_text, threshold)
            if fuzzy_match[1] >= threshold:
                return fuzzy_match[0], fuzzy_match[1] - 5  # 보정 페널티

        return ocr_text, 0.0

    def _apply_ocr_corrections(self, text: str) -> str:
        """일반적인 OCR 오류 보정"""
        corrections = {
            # 자주 발생하는 OCR 오류들
            '|': 'ㅣ',
            'l': 'ㅣ',
            '1': 'ㅣ',
            'I': 'ㅣ',
            'o': 'ㅇ',
            'O': 'ㅇ',
            '0': 'ㅇ',
            'rr': 'ㄱ',
            'rl': 'ㄴ',
            # 과목명 특화 보정
            '컴퓨터구초': '컴퓨터구조',
            '프로그래밍': '프로그래밍',
            '데이타베이스': '데이터베이스',
            '운영체계': '운영체제',
            '알고리듬': '알고리즘',
            '넷워크': '네트워크',
            '소프트웨어': '소프트웨어'
        }

        corrected = text
        for wrong, correct in corrections.items():
            corrected = corrected.replace(wrong, correct)

        return corrected

    def _simple_similarity(self, text1: str, text2: str) -> float:
        """간단한 유사도 계산 (fuzzywuzzy 없을 때 사용)"""
        return SequenceMatcher(None, text1, text2).ratio()

    def validate_table_data(self, ocr_results: List[Dict]) -> List[Dict]:
        """
        테이블 형태의 OCR 결과 검증 및 보정

        Args:
            ocr_results: OCR 결과 리스트 (각 항목은 딕셔너리)

        Returns:
            List[Dict]: 검증된 결과
        """
        validated_results = []

        for i, row in enumerate(ocr_results):
            logger.debug(f"행 {i+1} 검증 중: {row}")

            validated_row = row.copy()

            # 과목명 검증
            if '과목명' in row:
                original_subject = row['과목명']
                context = {
                    '교수명': row.get('교수명', ''),
                    '과목코드': row.get('과목코드', ''),
                    '학점': row.get('학점', '')
                }

                matched_subject, confidence, method = self.find_best_match(
                    original_subject, context, threshold=60
                )

                validated_row['과목명'] = matched_subject
                validated_row['과목명_신뢰도'] = confidence
                validated_row['매칭방법'] = method

                # 매칭된 과목의 정보로 다른 필드도 보정
                if confidence > 80 and matched_subject in self.subject_dict:
                    db_info = self.subject_dict[matched_subject]

                    # 과목코드 보정
                    if not row.get('과목코드') or confidence > 90:
                        validated_row['과목코드'] = db_info.get('과목코드', '')

                    # 학점 보정
                    if not row.get('학점') or confidence > 90:
                        validated_row['학점'] = db_info.get('학점', '')

            # 교수명 검증
            if '교수명' in row and validated_row.get('과목명'):
                professor = row['교수명']
                subject = validated_row['과목명']

                if self._validate_professor_subject_pair(professor, subject):
                    validated_row['교수명_검증'] = True
                else:
                    validated_row['교수명_검증'] = False
                    # DB에서 정확한 교수명 찾기
                    correct_professor = self._find_correct_professor(subject)
                    if correct_professor:
                        validated_row['교수명_제안'] = correct_professor

            validated_results.append(validated_row)

        logger.info(f"테이블 데이터 검증 완료: {len(validated_results)}행")
        return validated_results

    def _validate_professor_subject_pair(self, professor: str, subject: str) -> bool:
        """교수-과목 쌍 검증"""
        if professor in self.professor_dict:
            return subject in self.professor_dict[professor]
        return False

    def _find_correct_professor(self, subject: str) -> Optional[str]:
        """과목에 대한 정확한 교수명 찾기"""
        for professor, subjects in self.professor_dict.items():
            if subject in subjects:
                return professor
        return None

    def get_match_statistics(self, ocr_results: List[str]) -> Dict:
        """매칭 통계 정보"""
        stats = {
            'total_inputs': len(ocr_results),
            'exact_matches': 0,
            'fuzzy_matches': 0,
            'no_matches': 0,
            'average_confidence': 0.0,
            'match_methods': {}
        }

        total_confidence = 0.0

        for ocr_text in ocr_results:
            matched_text, confidence, method = self.find_best_match(ocr_text)

            total_confidence += confidence

            if confidence == 100:
                stats['exact_matches'] += 1
            elif confidence > 0:
                stats['fuzzy_matches'] += 1
            else:
                stats['no_matches'] += 1

            if method not in stats['match_methods']:
                stats['match_methods'][method] = 0
            stats['match_methods'][method] += 1

        if stats['total_inputs'] > 0:
            stats['average_confidence'] = total_confidence / stats['total_inputs']

        return stats

    def export_corrections(self, output_path: str = "data/training_data/match_corrections.xlsx"):
        """매칭 결과를 학습 데이터로 저장"""
        # 실제 구현에서는 사용자 피드백이나 수동 검증 결과를 저장
        corrections_data = []

        # 예시 데이터 구조
        sample_corrections = [
            {'original_ocr': '컴퓨터구초', 'corrected': '컴퓨터구조', 'confidence': 95},
            {'original_ocr': '프로그래밍', 'corrected': '프로그래밍', 'confidence': 100},
            {'original_ocr': 'OS', 'corrected': '운영체제', 'confidence': 90}
        ]

        df = pd.DataFrame(sample_corrections)
        df.to_excel(output_path, index=False)
        logger.info(f"매칭 보정 데이터 저장: {output_path}")


def main():
    """메인 실행 함수"""
    print("🔍 다중 학기 매칭 시스템 테스트")
    print("=" * 60)

    # 매칭 시스템 초기화
    matcher = MultiSemesterMatcher()

    if matcher.df.empty:
        print("❌ 통합 데이터베이스가 비어있습니다.")
        return

    # 테스트 OCR 결과
    test_ocr_results = [
        "컴퓨터구초",        # 컴퓨터구조
        "프로그래밍언어",     # 정확
        "5118020",         # 과목코드
        "OS",              # 운영체제 별명
        "데이타베이스",      # 데이터베이스 오타
        "인공지릉",         # 인공지능 오타
        "알고리듬",         # 알고리즘 오타
        "xxx과목",          # 매칭 실패 예시
    ]

    print("📝 OCR 결과 매칭 테스트:")
    print("-" * 40)

    for ocr_text in test_ocr_results:
        matched, confidence, method = matcher.find_best_match(ocr_text)

        status = "✅" if confidence > 80 else "⚠️" if confidence > 50 else "❌"
        print(f"{status} '{ocr_text}' → '{matched}' (신뢰도: {confidence:.1f}%, 방법: {method})")

    # 통계 정보
    print("\n📊 매칭 통계:")
    stats = matcher.get_match_statistics(test_ocr_results)
    print(f"  • 총 입력: {stats['total_inputs']}개")
    print(f"  • 정확 매칭: {stats['exact_matches']}개")
    print(f"  • 퍼지 매칭: {stats['fuzzy_matches']}개")
    print(f"  • 매칭 실패: {stats['no_matches']}개")
    print(f"  • 평균 신뢰도: {stats['average_confidence']:.1f}%")

    # 테이블 데이터 검증 테스트
    print("\n📋 테이블 데이터 검증 테스트:")
    test_table_data = [
        {
            '과목코드': '5118020',
            '과목명': '컴퓨터구초',
            '교수명': '김교수',
            '학점': '3'
        },
        {
            '과목코드': '',
            '과목명': 'OS',
            '교수명': '이교수',
            '학점': ''
        }
    ]

    validated_data = matcher.validate_table_data(test_table_data)

    for i, (original, validated) in enumerate(zip(test_table_data, validated_data)):
        print(f"\n행 {i+1}:")
        print(f"  원본: {original}")
        print(f"  검증: {validated}")

    print("\n✅ 매칭 시스템 테스트 완료!")


if __name__ == "__main__":
    main()
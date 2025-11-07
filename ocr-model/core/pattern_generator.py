"""
OCR 오류 패턴 생성기
실제 OCR에서 발생하는 오류를 시뮬레이션하여 학습 데이터 생성
"""

import random
import re
from typing import List, Dict, Tuple
import pandas as pd
import logging

logger = logging.getLogger(__name__)


class PatternGenerator:
    """OCR 오류 패턴 생성기"""

    def __init__(self):
        # 한글 자모 혼동 패턴
        self.jamo_confusion = {
            'ㅣ': ['|', 'l', '1', 'I'],
            'ㅇ': ['o', 'O', '0'],
            'ㅡ': ['-', '_', '―'],
            'ㄱ': ['r', 'ㄴ'],
            'ㄴ': ['ㄱ', 'L'],
            'ㄹ': ['ㄴ', 'ㅏ'],
            'ㅏ': ['ㅓ', 'ㅑ'],
            'ㅓ': ['ㅏ', 'ㅕ'],
            'ㅗ': ['ㅜ', 'ㅛ'],
            'ㅜ': ['ㅗ', 'ㅠ']
        }

        # 영문-한글 혼동 패턴
        self.eng_kor_confusion = {
            'a': ['ㅏ', 'ㅑ'],
            'o': ['ㅇ', 'ㅗ'],
            'i': ['ㅣ', 'ㅏ'],
            'u': ['ㅜ', 'ㅠ'],
            'e': ['ㅓ', 'ㅔ'],
            'l': ['ㅣ', '|'],
            'r': ['ㄱ', 'ㄴ'],
            'n': ['ㄴ', 'ㅏ'],
            's': ['ㅅ', 'ㅆ'],
            't': ['ㅌ', 'ㅜ']
        }

        # 유사 한글 글자 혼동
        self.similar_hangul = {
            '가': ['까', '나', '다'],
            '나': ['다', '라', '마'],
            '다': ['라', '마', '바'],
            '라': ['마', '바', '사'],
            '마': ['바', '사', '아'],
            '바': ['사', '아', '자'],
            '사': ['아', '자', '차'],
            '아': ['자', '차', '카'],
            '자': ['차', '카', '타'],
            '차': ['카', '타', '파'],
            '구': ['부', '수', '누'],
            '조': ['초', '소', '도'],
            '설': ['설', '절', '털'],
            '계': ['게', '개', '께']
        }

        # 과목명에서 자주 발생하는 오류 패턴
        self.subject_specific_errors = {
            '컴퓨터': ['컴퓨터', '컴퓨타', '컴퓨터'],
            '프로그래밍': ['프로그래밍', '프로그리밍', '프로그램밍'],
            '데이터베이스': ['데이터베이스', '데이타베이스', '데이터배이스'],
            '운영체제': ['운영체계', '운영체재', '운영체체'],
            '알고리즘': ['알고리즘', '알고리듬', '알고이듬'],
            '네트워크': ['네트워크', '네트워크', '넷워크'],
            '소프트웨어': ['소프트웨어', '소프트웨어', '소프트웨아'],
            '인공지능': ['인공지능', '인공지릉', '인공지뇽'],
            '시스템': ['시스템', '시스탬', '시스뎀'],
            '구조': ['구조', '구초', '구죠'],
            '설계': ['설계', '설게', '절계'],
            '분석': ['분석', '분서', '분설'],
            '개론': ['개론', '개룬', '개른'],
            '공학': ['공학', '공악', '공확'],
            '이론': ['이론', '이룬', '이른']
        }

    def generate_ocr_errors(self, text: str, error_rate: float = 0.3) -> List[str]:
        """
        주어진 텍스트에서 OCR 오류 패턴을 생성

        Args:
            text: 원본 텍스트
            error_rate: 오류 발생 비율 (0.0 ~ 1.0)

        Returns:
            List[str]: 다양한 OCR 오류 버전들
        """
        error_versions = [text]  # 원본도 포함

        # 1. 자모 분리/혼동 오류
        error_versions.extend(self._generate_jamo_errors(text, error_rate))

        # 2. 영문-한글 혼동 오류
        error_versions.extend(self._generate_eng_kor_errors(text, error_rate))

        # 3. 유사 글자 혼동 오류
        error_versions.extend(self._generate_similar_char_errors(text, error_rate))

        # 4. 과목명 특화 오류
        error_versions.extend(self._generate_subject_specific_errors(text))

        # 5. 공백/특수문자 오류
        error_versions.extend(self._generate_spacing_errors(text))

        # 6. 부분 인식 오류
        error_versions.extend(self._generate_partial_recognition_errors(text))

        # 중복 제거
        return list(set(error_versions))

    def _generate_jamo_errors(self, text: str, error_rate: float) -> List[str]:
        """자모 분리/혼동 오류 생성"""
        errors = []

        for _ in range(int(len(text) * error_rate) + 1):
            modified_text = text
            for jamo, confusions in self.jamo_confusion.items():
                if jamo in modified_text and random.random() < error_rate:
                    replacement = random.choice(confusions)
                    modified_text = modified_text.replace(jamo, replacement, 1)

            if modified_text != text:
                errors.append(modified_text)

        return errors

    def _generate_eng_kor_errors(self, text: str, error_rate: float) -> List[str]:
        """영문-한글 혼동 오류 생성"""
        errors = []

        # 한글을 영문으로
        modified_text = text
        for kor, eng_list in self.eng_kor_confusion.items():
            for eng in eng_list:
                if eng in modified_text and random.random() < error_rate:
                    modified_text = modified_text.replace(eng, kor, 1)

        if modified_text != text:
            errors.append(modified_text)

        # 영문을 한글로
        modified_text = text
        for eng, kor_list in self.eng_kor_confusion.items():
            if eng in modified_text and random.random() < error_rate:
                replacement = random.choice(kor_list)
                modified_text = modified_text.replace(eng, replacement, 1)

        if modified_text != text:
            errors.append(modified_text)

        return errors

    def _generate_similar_char_errors(self, text: str, error_rate: float) -> List[str]:
        """유사 글자 혼동 오류 생성"""
        errors = []

        for char, similar_chars in self.similar_hangul.items():
            if char in text and random.random() < error_rate:
                for similar in similar_chars[:2]:  # 상위 2개만
                    modified_text = text.replace(char, similar, 1)
                    errors.append(modified_text)

        return errors

    def _generate_subject_specific_errors(self, text: str) -> List[str]:
        """과목명 특화 오류 생성"""
        errors = []

        for subject, error_variants in self.subject_specific_errors.items():
            if subject in text:
                for variant in error_variants:
                    if variant != subject:
                        modified_text = text.replace(subject, variant)
                        errors.append(modified_text)

        return errors

    def _generate_spacing_errors(self, text: str) -> List[str]:
        """공백/특수문자 오류 생성"""
        errors = []

        # 공백 제거
        errors.append(text.replace(' ', ''))

        # 공백 추가
        if len(text) > 2:
            mid_pos = len(text) // 2
            errors.append(text[:mid_pos] + ' ' + text[mid_pos:])

        # 특수문자 혼동
        special_char_errors = text
        special_char_errors = special_char_errors.replace('-', '_')
        special_char_errors = special_char_errors.replace('(', '[')
        special_char_errors = special_char_errors.replace(')', ']')

        if special_char_errors != text:
            errors.append(special_char_errors)

        return errors

    def _generate_partial_recognition_errors(self, text: str) -> List[str]:
        """부분 인식 오류 생성 (앞뒤 잘림)"""
        errors = []

        if len(text) > 3:
            # 앞부분 잘림
            errors.append(text[1:])
            errors.append(text[2:])

            # 뒷부분 잘림
            errors.append(text[:-1])
            errors.append(text[:-2])

            # 중간 부분만
            if len(text) > 5:
                start = len(text) // 4
                end = len(text) * 3 // 4
                errors.append(text[start:end])

        return errors

    def generate_training_dataset(self, subjects: List[str], samples_per_subject: int = 10) -> pd.DataFrame:
        """
        과목 목록으로부터 학습 데이터셋 생성

        Args:
            subjects: 과목명 리스트
            samples_per_subject: 과목당 생성할 샘플 수

        Returns:
            pd.DataFrame: 학습 데이터셋 (original, corrupted, error_type)
        """
        training_data = []

        for subject in subjects:
            logger.info(f"'{subject}' 오류 패턴 생성 중...")

            # 다양한 오류 패턴 생성
            error_versions = self.generate_ocr_errors(subject, error_rate=0.4)

            # 샘플 수만큼 선택
            selected_errors = error_versions[:samples_per_subject]

            for error_text in selected_errors:
                error_type = self._classify_error_type(subject, error_text)

                training_data.append({
                    'original': subject,
                    'corrupted': error_text,
                    'error_type': error_type,
                    'similarity': self._calculate_similarity(subject, error_text)
                })

        df = pd.DataFrame(training_data)
        logger.info(f"학습 데이터셋 생성 완료: {len(df)}개 샘플")

        return df

    def _classify_error_type(self, original: str, corrupted: str) -> str:
        """오류 타입 분류"""
        if original == corrupted:
            return 'original'

        # 길이 비교
        if len(corrupted) < len(original):
            return 'truncation'
        elif len(corrupted) > len(original):
            return 'insertion'

        # 문자 타입 분석
        if re.search(r'[a-zA-Z]', corrupted) and not re.search(r'[a-zA-Z]', original):
            return 'eng_kor_confusion'

        # 공백 관련
        if ' ' in original and ' ' not in corrupted:
            return 'space_removal'
        elif ' ' not in original and ' ' in corrupted:
            return 'space_insertion'

        # 자모 혼동
        for jamo in self.jamo_confusion.keys():
            if jamo in original and jamo not in corrupted:
                return 'jamo_confusion'

        return 'character_substitution'

    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """두 텍스트 간 유사도 계산 (간단한 버전)"""
        if text1 == text2:
            return 1.0

        # 문자 단위 유사도
        common_chars = set(text1) & set(text2)
        total_chars = set(text1) | set(text2)

        if not total_chars:
            return 0.0

        return len(common_chars) / len(total_chars)

    def save_training_dataset(self, subjects: List[str], output_path: str = "data/training_data/ocr_error_patterns.xlsx"):
        """학습 데이터셋을 파일로 저장"""
        dataset = self.generate_training_dataset(subjects)
        dataset.to_excel(output_path, index=False)
        logger.info(f"학습 데이터셋 저장 완료: {output_path}")

        # 통계 정보 출력
        print(f"\n📊 생성된 학습 데이터 통계:")
        print(f"총 샘플 수: {len(dataset)}")
        print(f"고유 원본 과목 수: {dataset['original'].nunique()}")
        print(f"평균 유사도: {dataset['similarity'].mean():.3f}")

        print(f"\n📈 오류 타입별 분포:")
        error_type_counts = dataset['error_type'].value_counts()
        for error_type, count in error_type_counts.items():
            print(f"  • {error_type}: {count}개 ({count/len(dataset)*100:.1f}%)")

        return dataset

    def test_pattern_generation(self, test_subjects: List[str] = None):
        """패턴 생성 테스트"""
        if test_subjects is None:
            test_subjects = [
                "컴퓨터구조",
                "오픈소스플랫폼",
                "운영체제",
                "데이터베이스",
                "알고리즘",
                "프로그래밍언어"
            ]

        print("🧪 OCR 오류 패턴 생성 테스트")
        print("=" * 50)

        for subject in test_subjects:
            print(f"\n📝 원본: {subject}")
            errors = self.generate_ocr_errors(subject, error_rate=0.5)

            print(f"생성된 오류 패턴 ({len(errors)}개):")
            for i, error in enumerate(errors[:8], 1):  # 상위 8개만 출력
                if error != subject:
                    similarity = self._calculate_similarity(subject, error)
                    error_type = self._classify_error_type(subject, error)
                    print(f"  {i}. {error} (유사도: {similarity:.2f}, 타입: {error_type})")


def main():
    """메인 실행 함수"""
    print("🔧 OCR 오류 패턴 생성기 테스트")
    print("=" * 60)

    # 패턴 생성기 초기화
    generator = PatternGenerator()

    # 테스트 실행
    generator.test_pattern_generation()

    # 샘플 과목으로 학습 데이터 생성 (실제로는 DB에서 가져올 예정)
    sample_subjects = [
        "컴퓨터구조", "오픈소스플랫폼", "운영체제", "데이터베이스",
        "알고리즘", "프로그래밍언어", "소프트웨어공학", "네트워크",
        "인공지능", "컴퓨터그래픽스", "정보보안", "모바일프로그래밍"
    ]

    print(f"\n📚 {len(sample_subjects)}개 과목으로 학습 데이터 생성 중...")
    generator.save_training_dataset(sample_subjects)

    print("\n✅ OCR 오류 패턴 생성 완료!")


if __name__ == "__main__":
    main()
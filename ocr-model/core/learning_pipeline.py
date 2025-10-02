"""
점진적 학습 파이프라인
사용자 피드백과 OCR 결과를 지속적으로 학습하여 성능 향상
"""

import pandas as pd
import numpy as np
import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import logging

from .database_builder import DatabaseBuilder
from .pattern_generator import PatternGenerator
from .multi_semester_matcher import MultiSemesterMatcher

logger = logging.getLogger(__name__)


class LearningPipeline:
    """점진적 학습 파이프라인"""

    def __init__(self, base_data_dir: str = "data"):
        self.base_data_dir = base_data_dir
        self.training_data_dir = os.path.join(base_data_dir, "training_data")
        self.feedback_file = os.path.join(self.training_data_dir, "user_feedback.xlsx")
        self.corrections_file = os.path.join(self.training_data_dir, "ocr_corrections.xlsx")
        self.learning_log_file = os.path.join(self.training_data_dir, "learning_log.json")

        # 컴포넌트 초기화
        self.db_builder = DatabaseBuilder()
        self.pattern_generator = PatternGenerator()
        self.matcher = None

        self._ensure_directories()
        self._initialize_files()

    def _ensure_directories(self):
        """필요한 디렉토리 생성"""
        os.makedirs(self.training_data_dir, exist_ok=True)

    def _initialize_files(self):
        """학습 데이터 파일 초기화"""
        # 사용자 피드백 파일 초기화
        if not os.path.exists(self.feedback_file):
            feedback_df = pd.DataFrame(columns=[
                'timestamp', 'original_ocr', 'user_correction', 'confidence',
                'context', 'feedback_type', 'user_id'
            ])
            feedback_df.to_excel(self.feedback_file, index=False)

        # OCR 보정 파일 초기화
        if not os.path.exists(self.corrections_file):
            corrections_df = pd.DataFrame(columns=[
                'ocr_result', 'correct_result', 'frequency', 'confidence',
                'error_type', 'last_updated', 'auto_approved'
            ])
            corrections_df.to_excel(self.corrections_file, index=False)

        # 학습 로그 파일 초기화
        if not os.path.exists(self.learning_log_file):
            initial_log = {
                'last_update': datetime.now().isoformat(),
                'total_corrections': 0,
                'auto_approved_corrections': 0,
                'performance_history': []
            }
            with open(self.learning_log_file, 'w', encoding='utf-8') as f:
                json.dump(initial_log, f, ensure_ascii=False, indent=2)

    def collect_user_feedback(self, ocr_results: List[str], user_corrections: List[str],
                            context: Optional[Dict] = None, user_id: str = "anonymous") -> int:
        """
        사용자 피드백 수집

        Args:
            ocr_results: OCR 원본 결과
            user_corrections: 사용자 수정 결과
            context: 추가 컨텍스트 정보
            user_id: 사용자 ID

        Returns:
            int: 수집된 피드백 수
        """
        if len(ocr_results) != len(user_corrections):
            logger.error("OCR 결과와 사용자 수정 결과의 길이가 다릅니다")
            return 0

        feedback_data = []
        corrections_count = 0

        for ocr_result, user_correction in zip(ocr_results, user_corrections):
            if ocr_result.strip() != user_correction.strip():  # 수정이 있는 경우만
                feedback_data.append({
                    'timestamp': datetime.now().isoformat(),
                    'original_ocr': ocr_result,
                    'user_correction': user_correction,
                    'confidence': self._calculate_edit_confidence(ocr_result, user_correction),
                    'context': json.dumps(context or {}, ensure_ascii=False),
                    'feedback_type': self._classify_feedback_type(ocr_result, user_correction),
                    'user_id': user_id
                })
                corrections_count += 1

        if feedback_data:
            # 기존 피드백에 추가
            try:
                existing_feedback = pd.read_excel(self.feedback_file)
                new_feedback = pd.DataFrame(feedback_data)
                combined_feedback = pd.concat([existing_feedback, new_feedback], ignore_index=True)
                combined_feedback.to_excel(self.feedback_file, index=False)

                logger.info(f"사용자 피드백 {corrections_count}개 수집 완료")

                # 자동 학습 트리거
                self._process_new_feedback(feedback_data)

            except Exception as e:
                logger.error(f"피드백 저장 실패: {e}")

        return corrections_count

    def _calculate_edit_confidence(self, original: str, corrected: str) -> float:
        """편집 신뢰도 계산"""
        if original == corrected:
            return 1.0

        # 편집 거리 기반 신뢰도
        max_len = max(len(original), len(corrected))
        if max_len == 0:
            return 0.0

        # 간단한 편집 거리 계산
        common_chars = set(original) & set(corrected)
        total_chars = set(original) | set(corrected)

        if not total_chars:
            return 0.0

        similarity = len(common_chars) / len(total_chars)
        return min(0.9, similarity * 1.2)  # 최대 0.9로 제한

    def _classify_feedback_type(self, original: str, corrected: str) -> str:
        """피드백 타입 분류"""
        if len(corrected) < len(original):
            return 'truncation_fix'
        elif len(corrected) > len(original):
            return 'completion'
        elif any(c.isalpha() for c in original) != any(c.isalpha() for c in corrected):
            return 'lang_correction'
        else:
            return 'character_correction'

    def _process_new_feedback(self, feedback_data: List[Dict]):
        """새로운 피드백 처리 및 학습"""
        for feedback in feedback_data:
            self._update_corrections_database(
                feedback['original_ocr'],
                feedback['user_correction'],
                feedback['confidence']
            )

    def _update_corrections_database(self, ocr_result: str, correct_result: str, confidence: float):
        """보정 데이터베이스 업데이트"""
        try:
            corrections_df = pd.read_excel(self.corrections_file)

            # 기존 보정 찾기
            existing_mask = (corrections_df['ocr_result'] == ocr_result) & \
                          (corrections_df['correct_result'] == correct_result)

            if existing_mask.any():
                # 기존 보정 업데이트 (빈도 증가)
                corrections_df.loc[existing_mask, 'frequency'] += 1
                corrections_df.loc[existing_mask, 'confidence'] = \
                    (corrections_df.loc[existing_mask, 'confidence'] + confidence) / 2
                corrections_df.loc[existing_mask, 'last_updated'] = datetime.now().isoformat()
            else:
                # 새로운 보정 추가
                new_correction = {
                    'ocr_result': ocr_result,
                    'correct_result': correct_result,
                    'frequency': 1,
                    'confidence': confidence,
                    'error_type': self._classify_error_type(ocr_result, correct_result),
                    'last_updated': datetime.now().isoformat(),
                    'auto_approved': False
                }
                new_correction_df = pd.DataFrame([new_correction])
                corrections_df = pd.concat([corrections_df, new_correction_df], ignore_index=True)

            corrections_df.to_excel(self.corrections_file, index=False)

        except Exception as e:
            logger.error(f"보정 데이터베이스 업데이트 실패: {e}")

    def _classify_error_type(self, original: str, corrected: str) -> str:
        """오류 타입 분류"""
        if '컴퓨터' in original or '컴퓨터' in corrected:
            return 'subject_name'
        elif original.isdigit() or corrected.isdigit():
            return 'subject_code'
        elif any(name in original.lower() or name in corrected.lower()
                for name in ['교수', '박사', '선생']):
            return 'professor_name'
        else:
            return 'general_text'

    def auto_approve_corrections(self, min_frequency: int = 3, min_confidence: float = 0.8) -> int:
        """
        빈도와 신뢰도 기준으로 보정 자동 승인

        Args:
            min_frequency: 최소 빈도
            min_confidence: 최소 신뢰도

        Returns:
            int: 자동 승인된 보정 수
        """
        try:
            corrections_df = pd.read_excel(self.corrections_file)

            # 자동 승인 조건
            auto_approve_mask = (
                (corrections_df['frequency'] >= min_frequency) &
                (corrections_df['confidence'] >= min_confidence) &
                (~corrections_df['auto_approved'])
            )

            approved_count = auto_approve_mask.sum()

            if approved_count > 0:
                corrections_df.loc[auto_approve_mask, 'auto_approved'] = True
                corrections_df.to_excel(self.corrections_file, index=False)

                # 승인된 보정을 데이터베이스에 반영
                self._apply_approved_corrections(corrections_df[auto_approve_mask])

                logger.info(f"{approved_count}개 보정이 자동 승인되었습니다")

            return approved_count

        except Exception as e:
            logger.error(f"자동 승인 처리 실패: {e}")
            return 0

    def _apply_approved_corrections(self, approved_corrections: pd.DataFrame):
        """승인된 보정을 통합 데이터베이스에 반영"""
        if self.matcher is None:
            self.matcher = MultiSemesterMatcher()

        # 별명/약칭 추가
        for _, correction in approved_corrections.iterrows():
            original_ocr = correction['ocr_result']
            correct_result = correction['correct_result']

            if correct_result in self.matcher.subject_dict:
                # 기존 과목의 별명에 OCR 오류 패턴 추가
                current_aliases = self.matcher.alias_dict.get(correct_result, "")
                if original_ocr not in current_aliases:
                    self.matcher.alias_dict[original_ocr] = correct_result

        logger.info("승인된 보정이 매칭 시스템에 반영되었습니다")

    def generate_performance_report(self, days: int = 30) -> Dict:
        """성능 리포트 생성"""
        try:
            # 최근 N일간의 피드백 분석
            feedback_df = pd.read_excel(self.feedback_file)
            feedback_df['timestamp'] = pd.to_datetime(feedback_df['timestamp'])

            cutoff_date = datetime.now() - timedelta(days=days)
            recent_feedback = feedback_df[feedback_df['timestamp'] > cutoff_date]

            # 보정 데이터 분석
            corrections_df = pd.read_excel(self.corrections_file)

            report = {
                'period_days': days,
                'total_feedback': len(recent_feedback),
                'total_corrections': len(corrections_df),
                'auto_approved_corrections': len(corrections_df[corrections_df['auto_approved']]),
                'pending_corrections': len(corrections_df[~corrections_df['auto_approved']]),
                'average_confidence': float(corrections_df['confidence'].mean()) if len(corrections_df) > 0 else 0.0,
                'error_type_distribution': corrections_df['error_type'].value_counts().to_dict(),
                'feedback_type_distribution': recent_feedback['feedback_type'].value_counts().to_dict() if len(recent_feedback) > 0 else {},
                'most_common_corrections': corrections_df.nlargest(10, 'frequency')[
                    ['ocr_result', 'correct_result', 'frequency']
                ].to_dict('records'),
                'generated_at': datetime.now().isoformat()
            }

            return report

        except Exception as e:
            logger.error(f"성능 리포트 생성 실패: {e}")
            return {}

    def daily_learning_routine(self):
        """일일 학습 루틴"""
        logger.info("일일 학습 루틴 시작")

        # 1. 자동 승인 처리
        approved_count = self.auto_approve_corrections()

        # 2. 성능 리포트 생성
        report = self.generate_performance_report(days=7)

        # 3. 학습 로그 업데이트
        self._update_learning_log(report, approved_count)

        # 4. 오래된 데이터 정리
        self._cleanup_old_data(days=90)

        logger.info(f"일일 학습 루틴 완료: {approved_count}개 보정 승인")

    def _update_learning_log(self, report: Dict, approved_count: int):
        """학습 로그 업데이트"""
        try:
            with open(self.learning_log_file, 'r', encoding='utf-8') as f:
                log_data = json.load(f)

            log_data['last_update'] = datetime.now().isoformat()
            log_data['total_corrections'] = report.get('total_corrections', 0)
            log_data['auto_approved_corrections'] = report.get('auto_approved_corrections', 0)

            # 성능 히스토리 추가
            performance_entry = {
                'date': datetime.now().date().isoformat(),
                'total_feedback': report.get('total_feedback', 0),
                'approved_today': approved_count,
                'average_confidence': report.get('average_confidence', 0.0)
            }
            log_data['performance_history'].append(performance_entry)

            # 히스토리는 최근 30일만 유지
            log_data['performance_history'] = log_data['performance_history'][-30:]

            with open(self.learning_log_file, 'w', encoding='utf-8') as f:
                json.dump(log_data, f, ensure_ascii=False, indent=2)

        except Exception as e:
            logger.error(f"학습 로그 업데이트 실패: {e}")

    def _cleanup_old_data(self, days: int):
        """오래된 피드백 데이터 정리"""
        try:
            feedback_df = pd.read_excel(self.feedback_file)
            feedback_df['timestamp'] = pd.to_datetime(feedback_df['timestamp'])

            cutoff_date = datetime.now() - timedelta(days=days)
            recent_feedback = feedback_df[feedback_df['timestamp'] > cutoff_date]

            if len(recent_feedback) < len(feedback_df):
                recent_feedback.to_excel(self.feedback_file, index=False)
                removed_count = len(feedback_df) - len(recent_feedback)
                logger.info(f"{removed_count}개의 오래된 피드백 데이터를 정리했습니다")

        except Exception as e:
            logger.error(f"데이터 정리 실패: {e}")

    def export_training_data(self, output_dir: str = "data/training_data/exports"):
        """학습 데이터 내보내기"""
        os.makedirs(output_dir, exist_ok=True)

        try:
            # 1. 승인된 보정 데이터
            corrections_df = pd.read_excel(self.corrections_file)
            approved_corrections = corrections_df[corrections_df['auto_approved']]
            approved_corrections.to_excel(
                os.path.join(output_dir, f"approved_corrections_{datetime.now().date()}.xlsx"),
                index=False
            )

            # 2. 성능 리포트
            report = self.generate_performance_report(days=30)
            with open(os.path.join(output_dir, f"performance_report_{datetime.now().date()}.json"),
                     'w', encoding='utf-8') as f:
                json.dump(report, f, ensure_ascii=False, indent=2)

            # 3. 학습 통계
            stats = {
                'total_corrections': len(corrections_df),
                'approved_corrections': len(approved_corrections),
                'error_types': corrections_df['error_type'].value_counts().to_dict(),
                'export_date': datetime.now().isoformat()
            }

            with open(os.path.join(output_dir, f"learning_stats_{datetime.now().date()}.json"),
                     'w', encoding='utf-8') as f:
                json.dump(stats, f, ensure_ascii=False, indent=2)

            logger.info(f"학습 데이터 내보내기 완료: {output_dir}")

        except Exception as e:
            logger.error(f"학습 데이터 내보내기 실패: {e}")

    def simulate_learning_data(self, num_samples: int = 100):
        """학습 데이터 시뮬레이션 (테스트용)"""
        # 샘플 과목명들
        sample_subjects = [
            "컴퓨터구조", "오픈소스플랫폼", "운영체제", "데이터베이스",
            "알고리즘", "프로그래밍언어", "소프트웨어공학", "네트워크"
        ]

        simulated_feedback = []

        for _ in range(num_samples):
            original_subject = np.random.choice(sample_subjects)

            # 오류 패턴 생성
            error_patterns = self.pattern_generator.generate_ocr_errors(original_subject, error_rate=0.4)
            if error_patterns:
                ocr_result = np.random.choice(error_patterns)

                simulated_feedback.append({
                    'timestamp': datetime.now().isoformat(),
                    'original_ocr': ocr_result,
                    'user_correction': original_subject,
                    'confidence': np.random.uniform(0.6, 0.95),
                    'context': json.dumps({'simulation': True}, ensure_ascii=False),
                    'feedback_type': 'character_correction',
                    'user_id': 'simulation'
                })

        # 시뮬레이션 데이터 저장
        if simulated_feedback:
            existing_feedback = pd.read_excel(self.feedback_file)
            new_feedback = pd.DataFrame(simulated_feedback)
            combined_feedback = pd.concat([existing_feedback, new_feedback], ignore_index=True)
            combined_feedback.to_excel(self.feedback_file, index=False)

            logger.info(f"{len(simulated_feedback)}개의 시뮬레이션 학습 데이터 생성 완료")

            # 시뮬레이션 데이터로 학습 실행
            for feedback in simulated_feedback:
                self._update_corrections_database(
                    feedback['original_ocr'],
                    feedback['user_correction'],
                    feedback['confidence']
                )


def main():
    """메인 실행 함수"""
    print("📚 점진적 학습 파이프라인 테스트")
    print("=" * 60)

    # 학습 파이프라인 초기화
    pipeline = LearningPipeline()

    # 1. 시뮬레이션 데이터 생성
    print("🔧 시뮬레이션 학습 데이터 생성 중...")
    pipeline.simulate_learning_data(num_samples=50)

    # 2. 자동 승인 처리
    print("\n🤖 자동 승인 처리 중...")
    approved_count = pipeline.auto_approve_corrections(min_frequency=2, min_confidence=0.7)
    print(f"✅ {approved_count}개 보정이 자동 승인되었습니다")

    # 3. 성능 리포트 생성
    print("\n📊 성능 리포트 생성 중...")
    report = pipeline.generate_performance_report(days=30)

    print("📈 학습 시스템 현황:")
    print(f"  • 총 피드백: {report.get('total_feedback', 0)}개")
    print(f"  • 총 보정: {report.get('total_corrections', 0)}개")
    print(f"  • 자동 승인: {report.get('auto_approved_corrections', 0)}개")
    print(f"  • 평균 신뢰도: {report.get('average_confidence', 0):.3f}")

    if report.get('error_type_distribution'):
        print(f"\n🔍 오류 타입별 분포:")
        for error_type, count in list(report['error_type_distribution'].items())[:5]:
            print(f"  • {error_type}: {count}개")

    # 4. 일일 학습 루틴 실행
    print("\n⚙️ 일일 학습 루틴 실행 중...")
    pipeline.daily_learning_routine()

    # 5. 학습 데이터 내보내기
    print("\n💾 학습 데이터 내보내기 중...")
    pipeline.export_training_data()

    print("\n✅ 점진적 학습 파이프라인 테스트 완료!")


if __name__ == "__main__":
    main()
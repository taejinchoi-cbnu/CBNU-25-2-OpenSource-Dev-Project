from paddleocr import PaddleOCR
import cv2
import os
import json
from datetime import datetime
from typing import List, Dict, Optional, Tuple
import numpy as np

class MyPaddleOCR:
    """PaddleOCR 한국어 OCR 래퍼 클래스"""
    
    def __init__(self, lang='korean', use_gpu=False):
        """
        PaddleOCR 초기화
        
        Args:
            lang: 사용할 언어 (기본값: 'korean')
            use_gpu: GPU 사용 여부 (기본값: False)
        """
        self.lang = lang
        self.use_gpu = use_gpu
        self.ocr = None
        self.init_ocr()
        
    def init_ocr(self):
        """OCR 엔진 초기화"""
        try:
            print(f"🔄 Initializing PaddleOCR for language: {self.lang}")
            self.ocr = PaddleOCR(
                use_angle_cls=True,
                lang=self.lang,
                use_gpu=self.use_gpu,
                show_log=False
            )
            print(f"✅ PaddleOCR initialized successfully!")
        except Exception as e:
            print(f"❌ Failed to initialize PaddleOCR: {e}")
            raise
    
    def get_available_langs(self) -> List[str]:
        """
        지원 가능한 언어 목록 조회
        
        Returns:
            지원 언어 리스트
        """
        available_langs = [
            'ch', 'en', 'korean', 'japan', 'chinese_cht', 
            'ta', 'te', 'ka', 'latin', 'arabic', 
            'cyrillic', 'devanagari', 'french', 'german', 'structure'
        ]
        
        print(f"Available Language : {available_langs}")
        return available_langs
    
    def get_available_models(self) -> Dict[str, List[str]]:
        """
        사용 가능한 Model 조회
        
        Returns:
            모델 버전별 지원 언어 딕셔너리
        """
        models = {
            'PP-OCRv3': ['ch', 'en', 'korean', 'japan', 'chinese_cht', 
                        'ta', 'te', 'ka', 'latin', 'arabic', 
                        'cyrillic', 'devanagari'],
            'PP-OCRv2': ['ch'],
            'PP-OCR': ['ch', 'en', 'french', 'german', 'korean', 
                      'japan', 'chinese_cht', 'ta', 'te', 'ka', 
                      'latin', 'arabic', 'cyrillic', 'devanagari', 'structure']
        }
        
        # 출력 형식 맞추기
        for idx, (version, langs) in enumerate(models.items(), 1):
            print(f"#{idx} Model Version : [{version}] - Language : {langs}")
        
        return models
    
    def run_ocr(self, img_path: str, debug: bool = False) -> List[str]:
        """
        OCR 실행
        
        Args:
            img_path: 이미지 파일 경로
            debug: 디버그 모드 여부
        
        Returns:
            추출된 텍스트 리스트
        """
        # 디버그 모드 설정
        if debug:
            self.ocr = PaddleOCR(
                use_angle_cls=True,
                lang=self.lang,
                use_gpu=self.use_gpu,
                show_log=True  # 디버그 모드에서는 로그 표시
            )
        
        # 이미지 존재 확인
        if not os.path.exists(img_path):
            raise FileNotFoundError(f"Image file not found: {img_path}")
        
        # OCR 실행
        result = self.ocr.ocr(img_path, cls=True)
        
        # 텍스트 추출
        extracted_texts = []
        if result and result[0]:
            for line in result[0]:
                text = line[1][0]
                extracted_texts.append(text)
        
        # 결과 출력
        if extracted_texts:
            print(extracted_texts)
        else:
            print("No text detected")
        
        # 결과 저장
        self._save_results(img_path, result)
        
        return extracted_texts
    
    def _save_results(self, img_path: str, result: List):
        """OCR 결과 저장"""
        # 출력 디렉토리 생성
        os.makedirs('output/results', exist_ok=True)
        
        # 타임스탬프
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # JSON 형식으로 저장
        output_data = {
            'image_path': img_path,
            'timestamp': datetime.now().isoformat(),
            'language': self.lang,
            'results': []
        }
        
        if result and result[0]:
            for line in result[0]:
                output_data['results'].append({
                    'text': line[1][0],
                    'confidence': float(line[1][1]),
                    'bbox': line[0]
                })
        
        # JSON 파일 저장
        output_file = f'output/results/ocr_{timestamp}.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        print(f"💾 Results saved to: {output_file}")
    
    def visualize_result(self, img_path: str, save: bool = True) -> np.ndarray:
        """
        OCR 결과 시각화
        
        Args:
            img_path: 이미지 파일 경로
            save: 시각화 이미지 저장 여부
        
        Returns:
            시각화된 이미지
        """
        # OCR 실행
        result = self.ocr.ocr(img_path, cls=True)
        
        # 이미지 읽기
        img = cv2.imread(img_path)
        
        # 바운딩 박스 그리기
        if result and result[0]:
            for line in result[0]:
                bbox = np.array(line[0], dtype=np.int32)
                text = line[1][0]
                confidence = line[1][1]
                
                # 신뢰도에 따른 색상
                if confidence > 0.95:
                    color = (0, 255, 0)  # 녹색
                elif confidence > 0.85:
                    color = (0, 255, 255)  # 노란색
                else:
                    color = (0, 0, 255)  # 빨간색
                
                # 바운딩 박스 그리기
                cv2.polylines(img, [bbox], True, color, 2)
                
                # 텍스트 표시 (짧은 텍스트만)
                if len(text) <= 10:
                    cv2.putText(img, text, tuple(bbox[0]), 
                              cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
        
        # 저장
        if save:
            os.makedirs('output/visualizations', exist_ok=True)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_path = f'output/visualizations/vis_{timestamp}.jpg'
            cv2.imwrite(output_path, img)
            print(f"📊 Visualization saved to: {output_path}")
        
        return img


# 사용 예제
if __name__ == "__main__":
    # OCR 객체 생성
    ocr = MyPaddleOCR()
    
    # 지원 언어 확인
    ocr.get_available_langs()
    
    # 모델 정보 확인
    ocr.get_available_models()
    
    # OCR 실행 (이미지가 있는 경우)
    if os.path.exists('assets/images/test_image_3.jpg'):
        ocr.run_ocr('assets/images/test_image_3.jpg', debug=True)
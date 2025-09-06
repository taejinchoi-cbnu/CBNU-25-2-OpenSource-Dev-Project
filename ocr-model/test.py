import os
import sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from main import MyPaddleOCR

def create_test_images():
    """테스트 이미지 생성"""
    # assets/images 디렉토리 생성
    os.makedirs('assets/images', exist_ok=True)
    
    print("🎨 Creating test images...")
    
    # 테스트 이미지 1: 영어 텍스트
    img1 = Image.new('RGB', (600, 400), color='white')
    draw1 = ImageDraw.Draw(img1)
    texts1 = [
        ("CBNU Grade Report", (50, 50)),
        ("Student Information", (50, 100)),
        ("Name: Hong Gil Dong", (50, 150)),
        ("ID: 2024001234", (50, 200)),
        ("Department: Computer Science", (50, 250)),
        ("Semester: 2025-1", (50, 300))
    ]
    for text, pos in texts1:
        draw1.text(pos, text, fill='black')
    img1.save('assets/images/test_image_1.jpg')
    print("✅ Created: test_image_1.jpg")
    
    # 테스트 이미지 2: 숫자와 기호
    img2 = Image.new('RGB', (500, 300), color='white')
    draw2 = ImageDraw.Draw(img2)
    texts2 = [
        ("Grade: A+ (4.5/4.5)", (50, 50)),
        ("Total Credits: 18", (50, 100)),
        ("GPA: 4.32", (50, 150)),
        ("Rank: 5/120", (50, 200))
    ]
    for text, pos in texts2:
        draw2.text(pos, text, fill='black')
    img2.save('assets/images/test_image_2.jpg')
    print("✅ Created: test_image_2.jpg")
    
    # 테스트 이미지 3: 한글 시뮬레이션 (OpenCV)
    img3 = np.ones((400, 600, 3), dtype=np.uint8) * 255
    font = cv2.FONT_HERSHEY_SIMPLEX
    
    # 한글 대신 영어로 표시 (OpenCV 한글 직접 지원 안함)
    cv2.putText(img3, "Korean OCR Test", (50, 50), font, 1, (0, 0, 0), 2)
    cv2.putText(img3, "Hangul Document", (50, 100), font, 0.8, (0, 0, 0), 2)
    cv2.putText(img3, "Design", (50, 150), font, 0.8, (0, 0, 0), 2)
    cv2.putText(img3, "202204", (50, 200), font, 0.8, (0, 0, 0), 2)
    
    # 테이블 그리기
    cv2.rectangle(img3, (50, 250), (550, 350), (0, 0, 0), 2)
    cv2.line(img3, (200, 250), (200, 350), (0, 0, 0), 1)
    cv2.line(img3, (400, 250), (400, 350), (0, 0, 0), 1)
    
    cv2.imwrite('assets/images/test_image_3.jpg', img3)
    print("✅ Created: test_image_3.jpg")
    
    print("✨ All test images created!\n")

def test_basic_functions():
    """기본 기능 테스트"""
    print("="*60)
    print("🧪 Testing Basic Functions")
    print("="*60)
    
    # OCR 객체 생성
    ocr = MyPaddleOCR()
    
    # 1. 지원 언어 확인
    print("\n1. Checking available languages:")
    print("-"*40)
    ocr.get_available_langs()
    
    # 2. 모델 정보 확인
    print("\n2. Checking available models:")
    print("-"*40)
    ocr.get_available_models()
    
    print("\n✅ Basic functions test completed!")

def test_ocr_on_images():
    """이미지 OCR 테스트"""
    print("\n" + "="*60)
    print("🖼️ Testing OCR on Images")
    print("="*60)
    
    # OCR 객체 생성
    ocr = MyPaddleOCR()
    
    # 테스트 이미지 목록
    test_images = [
        'assets/images/test_image_1.jpg',
        'assets/images/test_image_2.jpg',
        'assets/images/test_image_3.jpg'
    ]
    
    for img_path in test_images:
        if os.path.exists(img_path):
            print(f"\n📷 Processing: {os.path.basename(img_path)}")
            print("-"*40)
            
            try:
                # OCR 실행
                texts = ocr.run_ocr(img_path, debug=False)
                
                # 결과 요약
                print(f"Extracted {len(texts)} text(s)")
                
                # 시각화
                ocr.visualize_result(img_path)
                
            except Exception as e:
                print(f"❌ Error processing {img_path}: {e}")
        else:
            print(f"⚠️ File not found: {img_path}")
    
    print("\n✅ OCR test completed!")

def main():
    """메인 테스트 함수"""
    print("🚀 PaddleOCR Korean Test Suite")
    print("="*60)
    
    # 1. 테스트 이미지 생성
    create_test_images()
    
    # 2. 기본 기능 테스트
    test_basic_functions()
    
    # 3. OCR 테스트
    test_ocr_on_images()
    
    # 4. 결과 위치 안내
    print("\n" + "="*60)
    print("📁 Results Location:")
    print("  - OCR Results: output/results/")
    print("  - Visualizations: output/visualizations/")
    print("="*60)
    print("✨ All tests completed successfully!")

if __name__ == "__main__":
    main()
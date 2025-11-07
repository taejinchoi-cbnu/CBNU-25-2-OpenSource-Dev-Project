import cv2
import os
from paddleocr import PaddleOCR, draw_ocr
from utils.image_util import plt_imshow, put_text
from paddleocr.paddleocr import MODEL_URLS


class MyPaddleOCR:
    def __init__(self, lang: str = "korean", **kwargs):
        self.lang = lang
        self._ocr = PaddleOCR(lang=lang, use_angle_cls=True, show_log=False)
        self.img_path = None
        self.ocr_result = {}
    
    def get_available_langs(self):
        langs_info = []

        for idx, model_name in enumerate(list(MODEL_URLS['OCR'].keys())):
            for lang in list(MODEL_URLS['OCR'][model_name]['rec'].keys()):
                if lang not in langs_info:
                    langs_info.append(lang)
        
        print('Available Language : {}'.format(langs_info))
        return langs_info
        
    def get_available_models(self):
        model_info = {}

        for idx, model_name in enumerate(list(MODEL_URLS['OCR'].keys())):
            model_info[model_name] = list(MODEL_URLS['OCR'][model_name]['rec'].keys())
            print('#{} Model Version : [{}] - Language : {}'.format(idx+1, model_name, list(MODEL_URLS['OCR'][model_name]['rec'].keys())))
        
        return model_info
        
    def get_ocr_result(self):
        return self.ocr_result

    def get_img_path(self):
        return self.img_path

    def show_img(self):
        plt_imshow(img=self.img_path)
        
    def run_ocr(self, img_path: str, debug: bool = False):
        self.img_path = img_path
        ocr_text = []
        result = self._ocr.ocr(img_path, cls=True)
        
        if result and result[0]:
            self.ocr_result = result[0]
            for r in result[0]:
                ocr_text.append(r[1][0])
                if debug:
                    print(f"Text: {r[1][0]}, Confidence: {r[1][1]:.4f}")
        else:
            self.ocr_result = []
            ocr_text = ["No text detected."]

        if debug and self.ocr_result:
            self.show_img_with_ocr()

        return ocr_text
    
    def show_img_with_ocr(self):
        img = cv2.imread(self.img_path)
        roi_img = img.copy()

        for text_result in self.ocr_result:
            text = text_result[1][0]
            confidence = text_result[1][1]
            tlX = int(text_result[0][0][0])
            tlY = int(text_result[0][0][1])
            trX = int(text_result[0][1][0])
            trY = int(text_result[0][1][1])
            brX = int(text_result[0][2][0])
            brY = int(text_result[0][2][1])
            blX = int(text_result[0][3][0])
            blY = int(text_result[0][3][1])

            pts = ((tlX, tlY), (trX, trY), (brX, brY), (blX, blY))

            topLeft = pts[0]
            topRight = pts[1]
            bottomRight = pts[2]
            bottomLeft = pts[3]

            cv2.line(roi_img, topLeft, topRight, (0, 255, 0), 2)
            cv2.line(roi_img, topRight, bottomRight, (0, 255, 0), 2)
            cv2.line(roi_img, bottomRight, bottomLeft, (0, 255, 0), 2)
            cv2.line(roi_img, bottomLeft, topLeft, (0, 255, 0), 2)
            
            display_text = f"{text} ({confidence:.2f})"
            roi_img = put_text(roi_img, display_text, topLeft[0], topLeft[1] - 20, font_size=15)

        plt_imshow(["Original", "OCR Result"], [img, roi_img], figsize=(16, 10))


def main():
    """테스트 이미지들에 대해 OCR을 수행하는 메인 함수"""
    print("=" * 50)
    print("Korean OCR using PaddleOCR - Test")
    print("=" * 50)
    
    # OCR 객체 생성
    ocr = MyPaddleOCR(lang="korean")
    
    # 사용 가능한 언어 및 모델 정보 출력
    print("\n[Available Languages]")
    ocr.get_available_langs()
    
    print("\n[Available Models]")
    ocr.get_available_models()
    
    # 테스트 이미지 경로
    test_images_dir = "assets/images"
    test_images = ["test_image_3.jpg"]
    
    # 각 테스트 이미지에 대해 OCR 수행
    for img_name in test_images:
        img_path = os.path.join(test_images_dir, img_name)
        
        if os.path.exists(img_path):
            print(f"\n{'=' * 50}")
            print(f"Processing: {img_name}")
            print("=" * 50)
            
            # OCR 실행 (debug=True로 시각화 포함)
            detected_texts = ocr.run_ocr(img_path, debug=True)
            
            print(f"\n[Detected Texts in {img_name}]")
            for i, text in enumerate(detected_texts, 1):
                print(f"{i}. {text}")
        else:
            print(f"\nWarning: {img_path} not found!")
    
    print("\n" + "=" * 50)
    print("OCR Test Completed!")
    print("=" * 50)


if __name__ == "__main__":
    main()
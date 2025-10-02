import cv2
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image, ImageDraw, ImageFont
import os


def plt_imshow(title=None, img=None, figsize=(8, 6)):
    if isinstance(title, list):
        if isinstance(img, list):
            fig, axes = plt.subplots(1, len(title), figsize=figsize)
            for i, (t, im) in enumerate(zip(title, img)):
                if isinstance(im, str):
                    im = cv2.imread(im)
                    im = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)
                axes[i].imshow(im)
                axes[i].set_title(t)
                axes[i].axis('off')
        else:
            print("Error: img should be a list when title is a list")
    else:
        plt.figure(figsize=figsize)
        if isinstance(img, str):
            img = cv2.imread(img)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        elif isinstance(img, np.ndarray):
            if len(img.shape) == 3 and img.shape[2] == 3:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        plt.imshow(img)
        if title:
            plt.title(title)
        plt.axis('off')
    plt.show()


def put_text(image, text, x, y, color=(0, 255, 0), font_size=20):
    """한글 텍스트를 이미지에 추가하는 함수"""
    img_pil = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(img_pil)
    
    # 폰트 설정 (한글 지원 폰트 필요)
    try:
        # Windows
        if os.name == 'nt':
            font_path = "C:/Windows/Fonts/malgun.ttf"
        # macOS
        elif os.name == 'posix' and os.uname().sysname == 'Darwin':
            font_path = "/System/Library/Fonts/AppleSDGothicNeo.ttc"
        # Linux
        else:
            font_path = "/usr/share/fonts/truetype/nanum/NanumGothic.ttf"
        
        if os.path.exists(font_path):
            font = ImageFont.truetype(font_path, font_size)
        else:
            # 폰트를 찾을 수 없으면 기본 폰트 사용
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # RGB로 색상 변환
    if len(color) == 3 and all(isinstance(c, int) for c in color):
        # BGR to RGB
        color = (color[2], color[1], color[0])
    
    draw.text((x, y), text, font=font, fill=color)
    
    # PIL 이미지를 다시 OpenCV 형식으로 변환
    img_cv = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
    return img_cv
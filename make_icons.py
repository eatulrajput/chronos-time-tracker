import os
import sys

def create_icon(size, filename):
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        import subprocess
        print("Pillow is not installed. Installing Pillow...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
        from PIL import Image, ImageDraw
        
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    margin = max(1, size // 10)
    stroke_width = max(1, size // 12)
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        outline=(102, 252, 241, 255),
        width=stroke_width
    )
    
    center = size // 2
    r_dot = max(1, size // 16)
    draw.ellipse(
        [center - r_dot, center - r_dot, center + r_dot, center + r_dot],
        fill=(102, 252, 241, 255)
    )
    
    hand_thickness = max(1, size // 16)
    draw.line(
        [center, center, center + size // 4, center - size // 6],
        fill=(255, 255, 255, 255),
        width=hand_thickness
    )
    draw.line(
        [center, center, center, margin + stroke_width + size // 12],
        fill=(102, 252, 241, 255),
        width=hand_thickness
    )
    
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    img.save(filename, 'PNG')
    print(f"Created icon: {filename} ({size}x{size})")

if __name__ == '__main__':
    create_icon(16, 'icons/icon16.png')
    create_icon(48, 'icons/icon48.png')
    create_icon(128, 'icons/icon128.png')

import os
import qrcode
from PIL import Image, ImageDraw

def create_test_images():
    output_dir = "photos_a_trier"
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. QR Code for Jean
    qr = qrcode.make('Jean DUPONT_12042026')
    qr.save(f"{output_dir}/IMG_0001.jpg")
    
    # 2. Portrait Jean 1
    generate_portrait("Portrait Jean 1", f"{output_dir}/IMG_0002.jpg")
    
    # 3. Portrait Jean 2
    generate_portrait("Portrait Jean 2", f"{output_dir}/IMG_0003.jpg")
    
    # 4. QR Code for Marie
    qr = qrcode.make('Marie MARTIN_12042026')
    qr.save(f"{output_dir}/IMG_0004.jpg")
    
    # 5. Portrait Marie 1
    generate_portrait("Portrait Marie 1", f"{output_dir}/IMG_0005.jpg")

def generate_portrait(text, filename):
    img = Image.new('RGB', (800, 600), color = (73, 109, 137))
    d = ImageDraw.Draw(img)
    d.text((10,10), text, fill=(255,255,0))
    img.save(filename)

if __name__ == "__main__":
    create_test_images()
    print("Test images generated in photos_a_trier/")

import qrcode
import string
import random
import os
from reportlab.pdfgen import canvas
from reportlab.lib import pagesizes

c = canvas.Canvas("8xQR.pdf", pagesize=pagesizes.A4)

os.system("rm -rf qrcodes")
os.system("mkdir qrcodes")

codes = []

for i in range(8):
    data = ""
    for j in range(7):
        data += random.choice(string.ascii_letters)
    img = qrcode.make(data, error_correction=qrcode.constants.ERROR_CORRECT_H, border=2)
    img.save(f"qrcodes/{data}.png")
    codes.append(data)

for i,data in enumerate(codes):
    if i%2 == 0:
        c.drawImage(f"qrcodes/{data}.png",23.33*2.84,(4.25+(70*int(i/2)))*2.84, width=70*2.84, height=70*2.84)
    else:
        c.drawImage(f"qrcodes/{data}.png", 116.66*2.84, (4.25+(70*int(i/2)))*2.84, width=70 * 2.84, height=70 * 2.84)

c.save()
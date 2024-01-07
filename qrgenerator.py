import qrcode
import string
import random
import os

os.system("rm -rf qrcodes")
os.system("mkdir qrcodes")

for i in range(10):
    data = ""
    for j in range(7):
        data += random.choice(string.ascii_letters)
    img = qrcode.make(data, error_correction=qrcode.constants.ERROR_CORRECT_H, border=2, )
    img.save(f"qrcodes/{data}.png")
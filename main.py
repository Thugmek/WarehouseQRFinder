import cv2
from flask import Flask, make_response
import threading
import base64

from finder import find_qr_codes

app = Flask(__name__)

camera_id = 0
num_images = 5

#input_image = None
input_image = cv2.imread("test-input.png")

found_qrs = {}

@app.route('/list')
def get_list():
    return list(a for a in found_qrs)

@app.route('/base-img')
def get_base_img():
    resized = cv2.resize(input_image, (640,480))
    retval, buffer = cv2.imencode('.png', resized)
    png_as_text = base64.b64encode(buffer)
    return f'<img src="data:image/png;base64,{png_as_text.decode("utf-8")}" />'

@app.route('/find/<id>')
def get_find(id):
    if id in found_qrs:
        pts = found_qrs[id].reshape((-1, 1, 2))
        img = cv2.polylines(input_image, [pts], True, (0,255,0), 10)
        resized = cv2.resize(img, (640, 480))
        retval, buffer = cv2.imencode('.png', resized)
        png_as_text = base64.b64encode(buffer)
        return f'<img src="data:image/png;base64,{png_as_text.decode("utf-8")}" />'
    else:
        return "" ,404

def scanner():
    global found_qrs
    while True:
        qrs = find_qr_codes(input_image)
        print("Found QRs:")
        for qr in qrs:
            print(f"\t{qr['text']}")
            found_qrs[qr['text']] = qr["quad"]



if __name__ == '__main__':
    my_thread = threading.Thread(target=scanner)
    my_thread.start()
    app.run()
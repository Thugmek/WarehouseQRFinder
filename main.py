import cv2
from flask import Flask, make_response
import threading
import base64

from finder import find_qr_codes

should_run = True

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
    retval, buffer = cv2.imencode('.jpg', last_image)
    png_as_text = base64.b64encode(buffer)
    return f'<img src="data:image/jpg;base64,{png_as_text.decode("utf-8")}" />'

@app.route('/find/<id>')
def get_find(id):
    if id in found_qrs:
        pts = found_qrs[id].reshape((-1, 1, 2))
        img = cv2.polylines(last_image, [pts], True, (0,255,0), 10)
        retval, buffer = cv2.imencode('.jpg', img)
        png_as_text = base64.b64encode(buffer)
        return f'<img src="data:image/jpg;base64,{png_as_text.decode("utf-8")}" />'
    else:
        return "" ,404

def scanner():
    global found_qrs
    global last_image

    cap = cv2.VideoCapture(camera_id)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 2592)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1944)
    cap.set(cv2.CAP_PROP_FORMAT, 0)

    while should_run:
        print("capturing images...")
        image_data = []
        for img in range(num_images):
            print(f"image {img}")
            ret, frame = cap.read()
            if ret:
                image_data.append(frame[0:1943, 900:2080])
                # image_data.append(frame)
            else:
                print("INVALID!")

        print(f"Calculating average from {len(image_data)} images.")
        avg_image = image_data[0]
        for i in range(len(image_data)):
            if i == 0:
                pass
            else:
                alpha = 1.0 / (i + 1)
                beta = 1.0 - alpha
                avg_image = cv2.addWeighted(image_data[i], alpha, avg_image, beta, 0.0)
        last_image = avg_image
        qrs = find_qr_codes(avg_image)
        print("Found QRs:")
        for qr in qrs:
            print(f"\t{qr['text']}")
            found_qrs[qr['text']] = qr["quad"]



if __name__ == '__main__':
    my_thread = threading.Thread(target=scanner)
    my_thread.start()
    app.run()
    should_run = False
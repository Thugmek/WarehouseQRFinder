import cv2
import numpy as np
from flask import Flask, make_response, request
from flask_cors import CORS
import threading
import base64
import time

from finder import find_qr_codes
import factorify
import config

should_run = True
app_config = config.get_config()

app = Flask(__name__)
CORS(app)
camera_id = app_config["camera"]
num_images = app_config["oversample"]

min_time = app_config["min_cycle_time"]

#last_image = None
last_image = cv2.imread("test-input.png")

found_qrs = {}


@app.route('/regions')
def get_regions():
    return {
        "regions": app_config["regions"]
    }

@app.route('/regions', methods=["POST"])
def post_regions():
    global regions
    data = request.json
    if "regions" in data:
        app_config["regions"] = data["regions"]
        config.save_config()
        return {}, 200
    else:
        return {}, 400

@app.route('/list')
def get_list():
    return list(a for a in found_qrs)

@app.route('/base-img')
def get_base_img():
    retval, buffer = cv2.imencode('.jpg', last_image)
    png_as_text = base64.b64encode(buffer)
    # return f'<img src="data:image/jpg;base64,{png_as_text.decode("utf-8")}" />'
    print(last_image.shape[1])
    print(last_image.shape[0])
    return {
        "image": png_as_text.decode("utf-8"),
        "width": last_image.shape[1],
        "height": last_image.shape[0]
    }

@app.route('/find/<id>')
def get_find(id):
    if id in found_qrs:
        print(found_qrs[id])
        pts = np.asarray(found_qrs[id]).reshape((-1, 1, 2))
        img = cv2.polylines(last_image, [pts], True, (0,255,0), 10)
        retval, buffer = cv2.imencode('.jpg', img)
        png_as_text = base64.b64encode(buffer)
        #return f'<img src="data:image/jpg;base64,{png_as_text.decode("utf-8")}" />'
        return {
            "image": png_as_text.decode("utf-8")
        }
    else:
        return {}, 404

@app.route('/search_stock',methods=["POST"])
def post_search_stock():
    data = request.json
    print(data)
    fbc = {}
    offset = 0
    if "filterByColumn" in data:
        fbc = data["filterByColumn"]
    if "offset" in data:
        offset = data["offset"]
    return factorify.get_stock_items(fbc, offset)

def scanner():
    global found_qrs
    global last_image

    cap = cv2.VideoCapture(camera_id)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 2592)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1944)
    cap.set(cv2.CAP_PROP_FORMAT, 0)

    while should_run:
        time_start = float(time.time())
        print("capturing images...")
        image_data = []
        for img in range(num_images):
            print(f"image {img}")
            ret, frame = cap.read()
            if ret:
                #image_data.append(frame[0:1943, 900:2080])
                image_data.append(frame)
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
        qrs = []
        n = 0
        for region in app_config["regions"]:
            print(f"Detecting region {n} - {region}")
            region_image = avg_image[region[1]:region[1]+region[3],region[0]:region[0]+region[2]]
            n += 1
            qrs += find_qr_codes(region_image,region)
        for qr in qrs:
            found_qrs[qr['text']] = qr["quad"]
        print(f"Found total {len(found_qrs)} QRs")
        time_delta = float(time.time()) - time_start
        if time_delta < min_time:
            print(f"Sleeping for {int(min_time - time_delta)} seconds")
            time.sleep(min_time - time_delta)



if __name__ == '__main__':
    my_thread = threading.Thread(target=scanner)
    my_thread.start()
    app.run()
    should_run = False
    factorify.logout()
import cv2
import numpy as np
from flask import Flask, make_response, request
from flask_cors import CORS
import threading
import base64
import time
import logging
import logging.handlers

logger = logging.getLogger()
logger.setLevel(logging.INFO)
formater = logging.Formatter('%(asctime)s\t%(name)s\t%(levelname)s\t%(message)s')
fh = logging.handlers.TimedRotatingFileHandler("warefinder.log", when="m",interval=10, backupCount=10)
fh.setFormatter(formater)
logger.addHandler(fh)
sh = logging.StreamHandler()
sh.setFormatter(formater)
logger.addHandler(sh)

from finder import find_qr_codes
#import factorify
import local_database
import config
import image_sources

should_run = True
app_config = config.get_config()

app = Flask(__name__)
CORS(app)

source_type = app_config["image_source"]["type"]
source_config = app_config["image_source"]["config"]
if source_type == "camera":
    image_source = image_sources.CameraSource(source_config)
elif source_type == "file":
    image_source = image_sources.FileSource(source_config)
elif source_type == "url":
    image_source = image_sources.URLSource(source_config)
elif source_type == "streamed":
    image_source = image_sources.StreamedCameraSource(source_config)
else:
    image_source = None

min_time = app_config["min_cycle_time"]

#last_image = None
last_image = cv2.imread("test-input.png")

found_qrs = {}
scan_times = []


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

@app.route('/scan-times')
def get_scan_times():
    return {
        "scan_times": scan_times
    }

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
        pts = np.asarray(found_qrs[id]).reshape((-1, 1, 2))
        img = last_image.copy()
        img = cv2.polylines(img, [pts], True, (0,255,0), 10)
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
    offset = 0
    search_string = data["search_string"] if "search_string" in data else ""
    search_in_boxes = data["search_in_boxes"] if "searchInBoxes" in data else True
    search_not_inBoxes = data["search_not_inBoxes"] if "searchNotInBoxes" in data else False
    # if "offset" in data:
    #     offset = data["offset"]
    return local_database.fulltext_search(search_string, search_in_boxes, search_not_inBoxes)

@app.route('/create_stock_item',methods=["POST"])
def post_create_stock_item():
    data = request.json
    name = data["name"] if "name" in data else None
    description = data["description"] if "description" in data else None
    position = data["position"] if "position" in data else None
    image = data["image"] if "image" in data else None
    local_database.add_warehouse_item(name,description,position,image)
    return {}, 200

@app.route('/remove_stock_item',methods=["POST"])
def post_remove_stock_item():
    data = request.json
    id = data["id"]
    local_database.remove_warehouse_item(id)
    return {}, 200

@app.route('/update_stock_item',methods=["POST"])
def post_update_stock_item():
    data = request.json
    id = data["id"]
    updated_fields = data["updatedFields"]
    local_database.update_warehouse_item(id, updated_fields)
    return {}, 200

def scanner():
    global found_qrs
    global last_image
    global scan_times
    logger.info(f"Scanner loop started.")
    while should_run:
        try:
            time_start = float(time.time())

            last_image = image_source.get_image()
            qrs = []
            n = 0
            for region in app_config["regions"]:
                logger.debug(f"Detecting region {n} - {region}")
                region_image = last_image[region[1]:region[1]+region[3],region[0]:region[0]+region[2]]
                n += 1
                qrs += find_qr_codes(region_image,region)
            for qr in qrs:
                found_qrs[qr['text']] = qr["quad"]
            logger.info(f"Found total {len(found_qrs)} QRs")
            time_delta = float(time.time()) - time_start
            if len(scan_times) < 30:
                scan_times.append(time_delta)
            else:
                scan_times = scan_times[1:] + [time_delta]
            if time_delta < min_time:
                logger.info(f"Sleeping for {int(min_time - time_delta)} seconds")
                time.sleep(min_time - time_delta)
        except Exception as e:
            logger.exception(e)
            time.sleep(5)



if __name__ == '__main__':
    my_thread = threading.Thread(target=scanner)
    my_thread.start()
    app.run()
    should_run = False
    #factorify.logout()
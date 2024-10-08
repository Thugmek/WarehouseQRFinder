from crypt import methods

import cv2
import numpy as np
from flask import Flask, make_response, request
from flask_cors import CORS
import threading
import base64
import time
import logging
import logging.handlers

from config import save_config

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

sources = {}
configured_image_sources = app_config["image_sources"]
for source in configured_image_sources:
    src = image_sources.source_factory(source)
    if src:
        sources[source["id"]] = {
            "source": src,
            "regions": source["regions"]
        }

min_time = app_config["min_cycle_time"]

#last_image = None
last_images = {}
for source in sources:
    try:
        last_images[source] = sources[source]["source"].get_image()
    except:
        last_images[source] = None

found_qrs = {}
scan_times = []

@app.route('/sources')
def get_sources():
    return {
        "sources": app_config["image_sources"]
    }

@app.route('/source/<source_id>')
def get_source(source_id):
    for index, source in enumerate(app_config["image_sources"]):
        if source["id"] == source_id:
            return source, 200
    return {}, 404

@app.route('/source/<source_id>', methods=["POST"])
def post_source(source_id):
    data = request.json
    updated_source = {
        "id": source_id,
        "type": data["type"],
        "config": data["config"],
        "regions": data["regions"]
    }
    src = image_sources.source_factory(updated_source)
    if src:
        sources[source_id] = {
            "source": src,
            "regions": updated_source["regions"]
        }
    else:
        return {}, 400

    for index, source in enumerate(app_config["image_sources"]):
        if source["id"] == source_id:
            app_config["image_sources"][index] = updated_source
            save_config()
            return {}, 200
    app_config["image_sources"].append(updated_source)
    save_config()
    return {}, 200


@app.route('/source/<source_id>', methods=["DELETE"])
def delete_source(source_id):
    if source_id in sources:
        del sources[source_id]
    else:
        return {}, 404

    remove_index = -1
    for index, source in enumerate(app_config["image_sources"]):
        if source["id"] == source_id:
            remove_index = index
            break
    if remove_index >= 0:
        del app_config["image_sources"][remove_index]
        save_config()
        return {}, 200
    else:
        return {}, 400

@app.route('/list-qrs')
def get_qrs():
    return found_qrs

@app.route('/scan-times')
def get_scan_times():
    return {
        "scan_times": scan_times
    }

@app.route('/test-config', methods=["POST"])
def post_test_config():
    data = request.json
    source = None
    if data["type"] == "camera":
        source = image_sources.CameraSource(data["config"])
    elif data["type"] == "file":
        source = image_sources.FileSource(data["config"])
    elif data["type"] == "url":
        source = image_sources.URLSource(data["config"])
    elif data["type"] == "streamed":
        source = image_sources.StreamedCameraSource(data["config"])

    img = source.get_image()
    retval, buffer = cv2.imencode('.jpg', img)
    png_as_text = base64.b64encode(buffer)
    # return f'<img src="data:image/jpg;base64,{png_as_text.decode("utf-8")}" />'
    print(img.shape[1])
    print(img.shape[0])
    return {
        "image": png_as_text.decode("utf-8"),
        "width": img.shape[1],
        "height": img.shape[0]
    }

@app.route('/base-img/<source_id>')
def get_base_img(source_id):
    img = last_images[source_id]
    retval, buffer = cv2.imencode('.jpg', img)
    png_as_text = base64.b64encode(buffer)
    # return f'<img src="data:image/jpg;base64,{png_as_text.decode("utf-8")}" />'
    print(img.shape[1])
    print(img.shape[0])
    return {
        "image": png_as_text.decode("utf-8"),
        "width": img.shape[1],
        "height": img.shape[0]
    }

@app.route('/debug-img/<source_id>')
def get_debug_img(source_id):
    img = last_images[str(source_id)].copy()
    for id in found_qrs:
        if found_qrs[id]["source"] == source_id:
            pts = np.asarray(found_qrs[id]["quad"]).reshape((-1, 1, 2))
            img = cv2.polylines(img, [pts], True, (0, 255, 0), 5)
    retval, buffer = cv2.imencode('.jpg', img)
    png_as_text = base64.b64encode(buffer)
    # return f'<img src="data:image/jpg;base64,{png_as_text.decode("utf-8")}" />'
    print(img.shape[1])
    print(img.shape[0])
    return {
        "image": png_as_text.decode("utf-8"),
        "width": img.shape[1],
        "height": img.shape[0]
    }

@app.route('/find/<id>')
def get_find(id):
    if id in found_qrs:
        pts = np.asarray(found_qrs[id]["quad"]).reshape((-1, 1, 2))
        img = last_images[found_qrs[id]["source"]].copy()
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
    if "image" in updated_fields:
        # Downscale image for performance reason
        nparr = np.fromstring(base64.b64decode(updated_fields["image"]), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        height, width = img.shape[:2]
        required_height = 200
        aspect_ratio = width / height
        required_width = int(required_height * aspect_ratio)
        img = cv2.resize(img, (required_width, required_height))
        retval, buffer = cv2.imencode('.jpg', img)
        jpg_base64 = base64.b64encode(buffer)
        updated_fields["image"] = jpg_base64
    local_database.update_warehouse_item(id, updated_fields)
    return {}, 200

def scanner():
    #global found_qrs
    global scan_times
    logger.info(f"Scanner loop started.")
    while should_run:
        time_start = float(time.time())
        try:
            for source in sources:
                try:
                    image = sources[source]["source"].get_image()
                    last_images[source] = image
                    qrs = []
                    n = 0
                    for region in sources[source]["regions"]:
                        logger.debug(f"Detecting region {n} - {region}")
                        region_image = image[region[1]:region[1]+region[3],region[0]:region[0]+region[2]]
                        n += 1
                        qrs += find_qr_codes(region_image,region)
                    for qr in qrs:
                        found_qrs[qr['text']] = {
                            "source": source,
                            "quad": qr["quad"]
                        }
                except Exception as e:
                    logger.exception(e)

            logger.info(f"Found total {len(found_qrs)} QRs")
            time_delta = float(time.time()) - time_start
            if len(scan_times) < 30:
                scan_times.append(time_delta)
            else:
                scan_times = scan_times[1:] + [time_delta]
            if time_delta < min_time:
                logger.info(f"Sleeping for {int(min_time - time_delta)} seconds")
                time.sleep(min_time - time_delta)
        except:
            pass



if __name__ == '__main__':
    my_thread = threading.Thread(target=scanner)
    my_thread.start()
    app.run()
    should_run = False
    #factorify.logout()
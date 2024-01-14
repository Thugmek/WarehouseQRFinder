import cv2
import urllib.request
import numpy as np

class GenericSource:
    def __init__(self, config):
        pass

    def get_image(self):
        return None


class FileSource(GenericSource):
    def __init__(self, config):
        super().__init__(config)
        if "file" not in config:
            raise Exception(f"Required field 'file' is missing")

        self.file = config["file"]

    def get_image(self):
        return cv2.imread(self.file)

class URLSource(GenericSource):
    def __init__(self, config):
        super().__init__(config)
        if "url" not in config:
            raise Exception(f"Required field 'url' is missing")

        self.url = config["url"]

    def get_image(self):
        req = urllib.request.urlopen(self.url)
        arr = np.asarray(bytearray(req.read()), dtype=np.uint8)
        return cv2.imdecode(arr, -1)


class CameraSource(GenericSource):
    def __init__(self, config):
        super().__init__(config)
        if "camera_id" not in config:
            raise Exception(f"Required field 'camera_id' is missing")
        self.camera_id = config["camera_id"]
        self.cap = cv2.VideoCapture(self.camera_id)

        if "oversample" in config:
            self.oversample = config["oversample"]
        else:
            self.oversample = 1

        if "width" in config:
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, config["width"])
        if "height" in config:
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config["height"])
        if "format" in config:
            self.cap.set(cv2.CAP_PROP_FORMAT, config["format"])

    def get_image(self):
        print("capturing images...")
        image_data = []
        for img in range(self.oversample):
            print(f"image {img}")
            ret, frame = self.cap.read()
            if ret:
                # image_data.append(frame[0:1943, 900:2080])
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
        return avg_image
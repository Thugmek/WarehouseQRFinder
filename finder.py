import os

from QReader.qreader import QReader
import cv2
import numpy as np
import logging

qreader = QReader(model_size="l", min_confidence=0.01)
def find_qr_codes(img, region):
    tmp_image = img.copy()
    res = []
    os.system("rm -rf debug/*")
    n = 0
    while True:
        logging.debug(f"Detecting QR codes {n}")
        result_zbar, result = qreader.detect_and_decode(image=tmp_image, return_detections=True)
        #cv2.imwrite(f"debug/{n}.png",tmp_image)
        n += 1
        found_qrs = 0
        for (text, res_zbar, scale_factor), detection in zip(result_zbar, result):
            if text is not None:
                found_qrs += 1
                pts = []
                pts_global = []
                for point in res_zbar.polygon:
                    pts.append((int(detection["bbox_xyxy"][0] + point[0]/scale_factor), int(detection["bbox_xyxy"][1] + point[1]/scale_factor)))
                    pts_global.append((int(detection["bbox_xyxy"][0] + point[0] / scale_factor) + region[0],
                                int(detection["bbox_xyxy"][1] + point[1] / scale_factor) + region[1]))
                pts = np.asarray(pts)
                r = {
                    "text": text,
                    "quad": pts_global
                }
                res.append(r)
                pts = pts.reshape((-1, 1, 2))
                tmp_image = cv2.fillPoly(tmp_image, [pts], (255, 0, 255))
        logging.debug(f"\tFound {found_qrs} QRs")
        if found_qrs == 0:
            break
    return res
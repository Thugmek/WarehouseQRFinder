from QReader.qreader import QReader
import cv2
import numpy as np

qreader = QReader(model_size="l", min_confidence=0.01)
def find_qr_codes(img):
    tmp_image = img.copy()
    res = []
    while True:
        print(f"Detecting QR codes")
        result_zbar, result = qreader.detect_and_decode(image=tmp_image, return_detections=True)
        found_qrs = 0
        for (text, res_zbar), detection in zip(result_zbar, result):
            if text is not None:
                found_qrs += 1
                pts = []
                for point in res_zbar.polygon:
                    pts.append((int(detection["bbox_xyxy"][0] + point[0]), int(detection["bbox_xyxy"][1] + point[1])))
                pts = np.asarray(pts)
                res.append({
                    "text": text,
                    "quad": pts
                })
                pts = pts.reshape((-1, 1, 2))
                tmp_image = cv2.fillPoly(tmp_image, [pts], (255, 0, 255))
        print(f"Found {found_qrs} QRs")
        if found_qrs == 0:
            break
    return res
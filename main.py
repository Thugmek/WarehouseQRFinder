from qreader import QReader
import cv2
import multiprocessing.pool
import numpy as np
import os

camera_id = 2
num_images = 5

# Define the window size and the overlap
window_size = 600
overlap = 100

qreader = QReader(model_size="l", min_confidence=0.01)

def find_qrs(x,y,img):
    print(f"Detecting region {x},{y}")
    return {
        "x": x,
        "y": y,
        "res": qreader.detect_and_decode(image=img, return_detections=True)
    }

def main():
    #pool = multiprocessing.pool.Pool(processes=1)

    cap = cv2.VideoCapture(camera_id)

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 2592)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1944)
    cap.set(cv2.CAP_PROP_FORMAT, 0)
    while True:
        print("capturing images...")
        image_data = []
        for img in range(num_images):
            print(f"image {img}")
            ret, frame = cap.read()
            if ret:
                image_data.append(frame[0:1943,900:2080])
                #image_data.append(frame)
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

        try:
            os.system("rm -rf outputs_single")
        except:
            pass

        os.system("mkdir outputs_single")

        print(f"Detecting QR codes")
        result = qreader.detect_and_decode(image=avg_image, return_detections=True)

        out_image = avg_image.copy()

        for text, detection in zip(result[0], result[1]):
            single_image = avg_image.copy()
            if text is not None:
            #if text == "LfpWgRh":
                p0 = (int(detection["polygon_xy"][0][0]), int(detection["polygon_xy"][0][1]))
                out_image = cv2.rectangle(out_image,
                                         (int(detection["bbox_xyxy"][0]), int(detection["bbox_xyxy"][1])),
                                         (int(detection["bbox_xyxy"][2]), int(detection["bbox_xyxy"][3])),
                                         (0, 255, 0), 3)
                out_image = cv2.putText(out_image, text, p0,
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1, cv2.LINE_AA)
                single_image = cv2.polylines(single_image, [detection["polygon_xy"].astype(np.int32)], True, (255, 0, 0), 3)
                single_image = cv2.polylines(single_image, [detection["quad_xy"].astype(np.int32)], True, (0, 255, 0), 3)
                single_image = cv2.polylines(single_image, [detection["padded_quad_xy"].astype(np.int32)], True, (0, 0, 255), 3)
                single_image = cv2.rectangle(single_image,
                                             (int(detection["bbox_xyxy"][0]),int(detection["bbox_xyxy"][1])),
                                             (int(detection["bbox_xyxy"][2]),int(detection["bbox_xyxy"][3])),
                                             (0, 255, 0), 3)
                cv2.imwrite(f"outputs_single/{text}.png", single_image)



        cv2.imwrite("output.png",out_image)
        cv2.imwrite("output_avg.png", avg_image)
        return

if __name__ == '__main__':
    main()
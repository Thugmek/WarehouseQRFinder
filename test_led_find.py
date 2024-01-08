import time
import cv2
import requests
import numpy as np

WAIT_TIME = 1
PURGE_FRAMES = 5

def find_leds(cap):
    requests.get("http://qrfinder.local:5000/set/-1")
    time.sleep(WAIT_TIME)

    for i in range(PURGE_FRAMES+1):
        while True:
            ret, base_frame = cap.read()
            if ret:
                break
    output = base_frame.copy()
    for i in range(28):
        requests.get(f"http://qrfinder.local:5000/set/{i}")
        time.sleep(WAIT_TIME)
        for i in range(PURGE_FRAMES+1):
            while True:
                ret, frame = cap.read()
                if ret:
                    break
        diff = cv2.subtract(frame,base_frame)
        gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)

        treshold = np.max(gray) * 0.9

        ret, thresh = cv2.threshold(gray, treshold, 255, cv2.THRESH_BINARY)
        masked = cv2.bitwise_and(diff,diff,mask=thresh)
        gray_masked = cv2.cvtColor(masked, cv2.COLOR_BGR2GRAY)

        total_brightness = np.sum(gray_masked)
        x_coords = np.arange(gray_masked.shape[1])
        y_coords = np.arange(gray_masked.shape[0])

        weighted_x = np.sum(x_coords * np.sum(gray_masked, axis=0)) / total_brightness
        weighted_y = np.sum(y_coords * np.sum(gray_masked, axis=1)) / total_brightness

        # The weighted (brightness-based) center of the image
        center = (int(weighted_x), int(weighted_y))
        diff = cv2.circle(diff, center,20,(0,255,0),3)
        output = cv2.circle(output, center, 5, (0, 255, 0), 3)

    cv2.imwrite("output.png", output)

    requests.get("http://qrfinder.local:5000/set/-1")

if __name__ == '__main__':
    cap = cv2.VideoCapture(2)
    if True:
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 2592)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1944)
    else:
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 800)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 600)
    #cap.set(cv2.CAP_PROP_FORMAT, 0)

    find_leds(cap)


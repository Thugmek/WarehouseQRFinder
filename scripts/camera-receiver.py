import requests
import numpy as np
import cv2
import urllib.request

resp = urllib.request.urlopen("http://localhost:5000/image")

image = np.asarray(bytearray(resp.read()), dtype="uint8")
img_np = cv2.imdecode(image, cv2.IMREAD_COLOR) # cv2.IMREAD_COLOR in OpenCV 3.1

print(img_np.shape)
cv2.imwrite("out.png",img_np)
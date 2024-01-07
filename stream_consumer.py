import cv2
cap = cv2.VideoCapture('http://qrfinder.local:8080/stream')

while True:
  ret, frame = cap.read()
  print(frame.shape)
  cv2.imshow('Video', frame)

  if cv2.waitKey(1) == 27:
    exit(0)
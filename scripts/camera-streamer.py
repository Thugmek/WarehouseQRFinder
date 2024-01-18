import time
from flask import Flask, make_response, request, Response
import cv2
import threading

app = Flask(__name__)

should_run = True

last_frame = None

@app.route('/image')
def get_regions():
    if last_frame is not None:
        retval, buffer = cv2.imencode('.png', last_frame)
        return make_response(buffer.tobytes())
    else:
        return "", 404

@app.route('/video_feed')
def video_feed():
    def gen_frames():
        while True:
            frame = last_frame
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')  # concat frame one by one and show result
            time.sleep(0.1)

    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

def camera_reader():
    global last_frame
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 5000)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 5000)
    while should_run:
        ret, frame = cap.read()
        last_frame = frame


my_thread = threading.Thread(target=camera_reader)
my_thread.start()
app.run(host="0.0.0.0")
should_run = False
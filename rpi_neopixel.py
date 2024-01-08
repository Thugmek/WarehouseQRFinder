import board
import neopixel
import time
from flask import Flask, make_response

num_leds = 28
pixels = neopixel.NeoPixel(board.D18, num_leds)
app = Flask(__name__)

@app.route('/set/<id>')
def set_led(id):
    pixels.fill((0, 0, 0))
    id = int(id)
    if num_leds > id >= 0:
        pixels[id] = (255, 0, 0)
    else:
        return "", 404

if __name__ == '__main__':
    app.run(host='0.0.0.0')
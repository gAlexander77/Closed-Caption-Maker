from flask import Flask, request, session, send_from_directory
from flask_cors import CORS
import uuid
from routes.video import video_bp
from routes.translate import translate_bp
from routes.captions import captions_bp
from utils.audio_to_text import transcribe_audio
from utils.translate_text import translate

app = Flask(__name__)
CORS(app)
app.secret_key = str(uuid.uuid4())

@app.route('/my-video/<filename>')
def get_video(filename):
    return send_from_directory('../in-out', filename)

@app.before_request
def ensure_session_id():
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    print("Session ID: "+ session['session_id'])

app.register_blueprint(video_bp, url_prefix='/video')
app.register_blueprint(translate_bp, url_prefix='/translate')
app.register_blueprint(captions_bp, url_prefix='/captions')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    
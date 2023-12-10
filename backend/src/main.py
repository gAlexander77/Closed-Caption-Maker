from flask import Flask, request, session
import uuid
from routes.video import video_bp
from routes.translate import translate_bp
from utils.audio_to_text import transcribe_audio
from utils.translate_text import translate

app = Flask(__name__)
app.secret_key = str(uuid.uuid4())

@app.before_request
def ensure_session_id():
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    print("Session ID: "+ session['session_id'])

app.register_blueprint(video_bp, url_prefix='/video')
app.register_blueprint(translate_bp, url_prefix='/translate')

print(translate())
# print(transcribe_audio("../in-out/test4.mp4"))

if __name__ == '__main__':
    app.run(debug=True)
    
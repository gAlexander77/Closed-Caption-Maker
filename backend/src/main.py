from flask import Flask, request, session, send_from_directory
from flask_cors import CORS
import uuid
from routes.video import video_bp
from routes.translate import translate_bp
from routes.captions import captions_bp
from utils.initialize_directory import initialize_directory

initialize_directory()
app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = "secret_key"

@app.route('/my-video/<filename>')
def get_video(filename):
    print(filename)
    return send_from_directory('../in-out/', filename)

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
    
    # app.run(host='localhost' ,port=5000, debug=True)

    
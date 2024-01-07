from flask import Flask, request, session, send_from_directory
from dotenv import load_dotenv
from flask_cors import CORS
import uuid
import os

from routes.video import video_bp
from routes.translate import translate_bp
from routes.captions import captions_bp
from utils.initialize_directory import initialize_directory


# Initialization
load_dotenv()
initialize_directory()
app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.getenv('SECRET_KEY', 'default_secret_key')

# Route to get the videos created and uploaded
@app.route('/my-video/<filename>')
def get_video(filename):
    print(filename)
    return send_from_directory('../in-out/', filename)

# Creates a session ID for the user
@app.before_request
def ensure_session_id():
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    print("Session ID: "+ session['session_id'])

# Route blueprints
app.register_blueprint(video_bp, url_prefix='/video')
app.register_blueprint(translate_bp, url_prefix='/translate')
app.register_blueprint(captions_bp, url_prefix='/captions')

if __name__ == '__main__':
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = os.getenv('FLASK_PORT', '5000')
    app.run(host=host, port=port, debug=True)
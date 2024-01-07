from flask import Blueprint, request, session, jsonify
from utils.add_captions import add_captions_to_video

captions_bp = Blueprint('captions', __name__)

@captions_bp.route('/', methods=['POST'])
def upload_video():
    videoPath= f"./in-out/{session['session_id']}.mp4"
    saveVideoPath= f"./in-out/{session['session_id']}-captions.mp4"
    
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    
    transcript = data.get('transcript')
    videoPath = f"./in-out/{data.get('filename')}"

    if not transcript:
        return jsonify({"error": "No transcript"}), 400

    add_captions_to_video(videoPath, transcript, saveVideoPath)

    return jsonify({"video": f"{session['session_id']}-captions.mp4"}), 200
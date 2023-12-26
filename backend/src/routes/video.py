from flask import Blueprint, request, session, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from utils.audio_to_text import transcribe_audio
from pytube import YouTube
import os

video_bp = Blueprint('video', __name__)
CORS(video_bp)

ALLOWED_EXTENSIONS = {'mp4'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@video_bp.route('/upload-video', methods=['POST'])
def upload_video():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']

    # If the user does not select a file, the browser submits an
    # empty file without a filename.
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        session_id = session.get('session_id', 'default_session')
        save_path = os.path.join('../in-out', f"{session_id}.mp4")
        file.save(save_path)

        print(f"{session_id}: File uploaded successfully")
        print(f"{session_id}: Waiting for transcript...")

        try:
            transcript = transcribe_audio(audio_file_path=save_path)
            session['transcript'] = transcript
            print(transcript)
            return jsonify({"message": "File uploaded and transcribed successfully", "transcript": transcript}), 200
        except Exception as e:
            return jsonify({"error": f"An error occurred during transcription: {str(e)}"}), 500
    else:
        return jsonify({"error": "Invalid file format"}), 400

@video_bp.route('/upload-youtube-video', methods=['POST'])
def upload_youtube_video():

    if 'url' not in request.form:
        return "No URL provided", 400

    url = request.form['url']
    path = '../in-out'

    try:
        yt = YouTube(url)
        video = yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first()
        filename = f"{session['session_id']}.mp4"
        video.download(output_path=path, filename=filename)
        filelocation = f"{path}/{filename}"
        print(session['session_id']+": Done Downloading")
        print(session['session_id']+": Waiting for transcript...")
        transcript = transcribe_audio(audio_file_path=filelocation)
        session['transcript'] = transcript
        print(transcript)

        return jsonify({"message": "Video downloaded successfully", "transcript": transcript, "filename": filename}), 200
    except Exception as e:
        return f"An error occurred: {str(e)}", 500
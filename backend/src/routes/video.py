from flask import Blueprint, request, session, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
from pytube import YouTube
import yt_dlp
import os

from utils.audio_to_text import transcribe_audio

video_bp = Blueprint('video', __name__)
CORS(video_bp)

ALLOWED_EXTENSIONS = {'mp4'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@video_bp.route('/upload-video', methods=['POST'])
def upload_video():
    save_location = './in-out'
    session_id = session['session_id']
    video_name = f"{session_id}.mp4"
    save_path = os.path.join(save_location, video_name)

    if 'file' not in request.files:
        return jsonify({'error': "No file in request."}), 400
    else:
        file = request.files['file']
        file.save(save_path)
        print(session['session_id']+": Uploaded video Successfully")

    try:
        print(session['session_id']+": Waiting for transcript...")
        transcript = transcribe_audio(audio_file_path=save_path)
        session['transcript'] = transcript
        print(transcript)

        return jsonify({"message": "Video downloaded successfully", "transcript": transcript, "filename": video_name}), 200
    except Exception as e:
        return f"An error occurred: {str(e)}", 500

@video_bp.route('/upload-youtube-video', methods=['POST'])
def upload_youtube_video():
    if 'url' not in request.form:
        return "No URL provided", 400

    url = request.form['url']
    path = './in-out'
    cookies_path = './cookies.txt'

    if 'session_id' not in session:
        return "Session ID not found in session", 400

    session_id = session['session_id']
    filelocation = os.path.join(path, f"{session_id}")

    try:
        os.makedirs(path, exist_ok=True)

        print(f"Processing URL: {url}")
        ydl_opts = {
            'format': 'bestvideo+bestaudio/best',
            'outtmpl': filelocation, 
            'postprocessors': [{
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4',
            }],
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        final_filelocation = f"{filelocation}.mp4"
        print(f"{session_id}: Done Downloading to {final_filelocation}")

        print(f"{session_id}: Waiting for transcript...")
        transcript = transcribe_audio(audio_file_path=final_filelocation)
        if not transcript:
            return "Transcription failed", 500

        session['transcript'] = transcript
        print(f"Transcript: {transcript}")

        return jsonify({
            "message": "Video downloaded successfully",
            "transcript": transcript,
            "filename": f"{session_id}.mp4"
        }), 200
    except Exception as e:
        error_message = f"An error occurred: {str(e)}"
        print(error_message)
        return error_message, 500
        
# def upload_youtube_video():

#     if 'url' not in request.form:
#         return "No URL provided", 400

#     url = request.form['url']
#     path = './in-out'

#     try:
#         yt = YouTube(url)
#         video = yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first()
#         filename = f"{session['session_id']}.mp4"
#         video.download(output_path=path, filename=filename)
#         filelocation = f"{path}/{filename}"
#         print(session['session_id']+": Done Downloading")
#         print(session['session_id']+": Waiting for transcript...")
#         transcript = transcribe_audio(audio_file_path=filelocation)
#         session['transcript'] = transcript
#         print(transcript)

#         return jsonify({"message": "Video downloaded successfully", "transcript": transcript, "filename": filename}), 200
#     except Exception as e:
#         return f"YouTube has blocked this feature, try Upload Video", 500
#         # return f"An error occurred: {str(e)}", 500
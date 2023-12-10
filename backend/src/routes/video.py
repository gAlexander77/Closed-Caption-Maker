from flask import Blueprint, request, session, jsonify
from utils.audio_to_text import transcribe_audio
from pytube import YouTube
import os

video_bp = Blueprint('video', __name__)

@video_bp.route('/upload-video', methods=['POST'])
def upload_video():
    return "test"

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

        return jsonify({"message": "Video downloaded successfully", "transcript": transcript}), 200
    except Exception as e:
        return f"An error occurred: {str(e)}", 500
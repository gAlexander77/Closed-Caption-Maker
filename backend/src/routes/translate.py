from flask import Blueprint, request, session, jsonify
from utils.translate_text import translate_transcript

translate_bp = Blueprint('translate', __name__)

@translate_bp.route('/', methods=['POST'])
def translate():
    if 'transcript' in request.form:
        transcript = request.form['transcript']
    elif 'transcript' in session:
        transcript = session['transcript']
    else:
        return "No transcript available", 400

    translated_transcript = translate_transcript(transcript=transcript, translate_to=request.form['language'])

    session['transcript'] = translated_transcript

    return jsonify({"translated_transcript": translated_transcript}), 200


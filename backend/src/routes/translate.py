from flask import Blueprint, request, session, jsonify
from utils.translate_text import translate_transcript

translate_bp = Blueprint('translate', __name__)

@translate_bp.route('/', methods=['POST'])
def translate():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    transcript = data.get('transcript')
    language = data.get('language')

    if not transcript or not language:
        return jsonify({"error": "Missing 'transcript' or 'language' in request"}), 400
    
    print(transcript)
    
    translated_transcript = translate_transcript(transcript=transcript, translate_to=language)
    
    if not translated_transcript:
        return jsonify({"error": f"There was an error translating 'transcript' to '{language}'"}), 400

    session['transcript'] = translated_transcript

    return jsonify({"translated_transcript":translated_transcript}), 200
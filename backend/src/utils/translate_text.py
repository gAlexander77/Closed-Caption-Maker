from deep_translator import GoogleTranslator

def translate(text="There was an error", translate_to="en"):
    translated = GoogleTranslator(source='auto', target=translate_to).translate(text)
    return translated

TRANSCRIPT_FORMAT = [
    {
        "start": "00:00:00.00",
        "end": "00:00:00.00",
        "text": "There was an error",
    }
]

def translate_transcript(transcript=TRANSCRIPT_FORMAT, translate_to="en"):
    print("Translating to: " + translate_to)
    for entry in transcript:
        entry["text"] = translate(text=entry["text"], translate_to=translate_to)
    return transcript
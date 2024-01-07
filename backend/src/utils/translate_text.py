from deep_translator import GoogleTranslator

# Tanslates an individual entry
def translate(text="There was an error", translate_to="en"):
    translated = GoogleTranslator(source='auto', target=translate_to).translate(text)
    if translated is not None:
        return translated
    else:
        return text

# Default input if transcript is null
TRANSCRIPT_FORMAT = [
    {
        "start": "00:00:00.00",
        "end": "00:00:00.00",
        "text": "There was an error",
    }
]

# Call the translate function for each entry in the transcript
def translate_transcript(transcript=TRANSCRIPT_FORMAT, translate_to="en"):
    print("Translating to: " + translate_to)
    for entry in transcript:
        entry["text"] = translate(text=entry["text"], translate_to=translate_to)
    return transcript
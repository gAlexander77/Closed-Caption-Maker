import whisper

def transcribe_audio(audio_file_path, model_size="base"):

    model = whisper.load_model(model_size)
    result = model.transcribe(audio_file_path)
    print(result["language"])
    segments = result["segments"]
    formatted_segments = []

    for segment in segments:
        start_time = format_time(segment["start"])
        end_time = format_time(segment["end"])
        text = segment["text"]
        formatted_segments.append({"start": start_time, "end": end_time, "text": text})

    return formatted_segments

def format_time(seconds):
    millisec = int((seconds - int(seconds)) * 1000)
    return f"{int(seconds // 3600):02}:{int(seconds % 3600 // 60):02}:{int(seconds % 60):02}.{millisec:03}"
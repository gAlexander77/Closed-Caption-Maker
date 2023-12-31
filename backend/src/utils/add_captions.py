from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip

def add_captions_to_video(video_path, transcript, output_path):
    video = VideoFileClip(video_path)
    clips = [video]

    for entry in transcript:
        start_time = convert_time_to_seconds(entry["start"])
        end_time = convert_time_to_seconds(entry["end"])

        txt_clip = (TextClip(entry["text"], fontsize=24, color='white', bg_color='black', font='Arial-Unicode-MS')
                    .set_position('bottom')
                    .set_start(start_time)
                    .set_duration(end_time - start_time)
                    .set_end(end_time))

        clips.append(txt_clip)

    final_clip = CompositeVideoClip(clips, size=video.size)

    if video.audio is not None:
        final_clip = final_clip.set_audio(video.audio)
        print("SET AUDIO TO: ", final_clip)

    final_clip.write_videofile(output_path, codec='libx264', fps=video.fps, audio_codec='aac')

def convert_time_to_seconds(time_str):
    h, m, s = time_str.split(':')
    s, ms = s.split('.')
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000
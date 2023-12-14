import React, { FC, useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import "../../../styles/pages/Home/components/VideoAndTranscriptEditor.css";

interface TranscriptEntry {
    end: string;
    start: string;
    text: string;
}

interface VideoAndTranscriptEditorProps {
    transcript: TranscriptEntry[];
    filename: string;
}

// Video And Transcript Editor
const VideoAndTranscriptEditor: FC<VideoAndTranscriptEditorProps> = ({
    transcript,
    filename,
}) => {
    const [currentTime, setCurrentTime] = useState(0);
    return (
        <div className="video-and-transcript-editor-component">
            <VideoPlayer
                transcript={transcript}
                filename={filename}
                setCurrentTime={setCurrentTime}
            />
            <TranscriptEditor
                transcript={transcript}
                currentTime={currentTime}
            />
            <DownloadVideoWithCaptions />
            <TranslateTranscript />
        </div>
    );
};

export default VideoAndTranscriptEditor;

interface VideoPlayerProps {
    transcript: TranscriptEntry[];
    filename: string;
    setCurrentTime: (currentTime: number) => void;
}

// Component For Video And Transcript Editor
const VideoPlayer: FC<VideoPlayerProps> = ({
    transcript,
    filename,
    setCurrentTime,
}) => {
    const convertJsonToWebVTT = (jsonTranscript: any) => {
        let vttString = "WEBVTT\n\n";

        jsonTranscript.forEach((entry: any) => {
            vttString += `${entry.start} --> ${entry.end}\n`;
            vttString += `${entry.text}\n\n`;
        });
        console.log(vttString);
        return vttString;
    };

    const [subtitlesUrl, setSubtitlesUrl] = useState("");
    useEffect(() => {
        if (transcript) {
            const webVttString = convertJsonToWebVTT(transcript);
            const blob = new Blob([webVttString], { type: "text/vtt" });
            setSubtitlesUrl(URL.createObjectURL(blob));
            console.log(subtitlesUrl);
        }
    }, [transcript]);

    const playerRef = useRef(null);
    const handleProgress = (state: any) => {
        // state.playedSeconds gives the current time
        setCurrentTime(state.playedSeconds.toFixed(0));
    };

    return (
        <div className="video-player-">
            <ReactPlayer
                ref={playerRef}
                onProgress={handleProgress}
                url={"http://172.16.2.39:5000/my-video/" + filename}
                width="100%"
                height="100%"
                controls={true}
                playing={false}
                // Additional props for more customization
                config={{
                    file: {
                        tracks: [
                            {
                                kind: "subtitles",
                                src: subtitlesUrl,
                                srcLang: "en",
                                label: "English", // Label for the track
                                default: true,
                            },
                        ],
                    },
                }}
            />
        </div>
    );
};

interface TranscriptEditorProps {
    transcript: TranscriptEntry[];
    currentTime: number;
}

const TranscriptEditor: FC<TranscriptEditorProps> = ({
    transcript,
    currentTime,
}) => {
    return (
        <div>
            <h1>Transcript</h1>
            <div>
                {transcript.map((entry, index) => (
                    <IndividualTranscriptEntry
                        key={index}
                        start={entry.start}
                        text={entry.text}
                        end={entry.end}
                        currentTime={currentTime}
                    />
                ))}
            </div>
        </div>
    );
};

interface IndividualTranscriptEntryProps {
    start: string;
    text: string;
    end: string;
    currentTime: number;
}

// Each Individual Transcript Entry For TranscriptEditor
const IndividualTranscriptEntry: FC<IndividualTranscriptEntryProps> = ({
    start,
    text,
    end,
    currentTime,
}) => {
    const convertTimeToSeconds = (timeString: string): number => {
        const parts = timeString.split(":");
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseFloat(parts[2]);

        return hours * 3600 + minutes * 60 + seconds;
    };

    const startTimeInSeconds = convertTimeToSeconds(start);
    const endTimeInSeconds = convertTimeToSeconds(end);

    const isCurrentTimeInRange =
        currentTime >= startTimeInSeconds && currentTime < endTimeInSeconds;

    return (
        <div
            style={{
                display: "flex",
                background: isCurrentTimeInRange ? "blue" : "white",
                width: "100%",
            }}
        >
            <div>
                <input id="start" defaultValue={start} />
            </div>
            <div style={{ width: "100%" }}>
                <input
                    id="text"
                    defaultValue={text}
                    style={{ width: "100%", background: "transparent" }}
                />
            </div>
            <div>
                <input id="end" defaultValue={end} />
            </div>
        </div>
    );
};

const DownloadVideoWithCaptions: FC = () => {
    return (
        <div>
            <button>Download Video With Captions</button>
        </div>
    );
};

const TranslateTranscript: FC = () => {
    return (
        <div>
            <button>Translate</button>
        </div>
    );
};

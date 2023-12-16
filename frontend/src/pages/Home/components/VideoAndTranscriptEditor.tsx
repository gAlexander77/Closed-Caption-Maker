import React, { FC, useState, useEffect, useRef, createRef } from "react";
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
    }, [transcript, subtitlesUrl]);

    const playerRef = useRef(null);
    const handleProgress = (state: any) => {
        setCurrentTime(state.playedSeconds.toFixed(0));
    };

    return (
        <div className="video-player">
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
    const convertTimeToSeconds = (timeString: string): number => {
        const parts = timeString.split(":");
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseFloat(parts[2]);

        return hours * 3600 + minutes * 60 + seconds;
    };

    const entryRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
    entryRefs.current = transcript.map(
        (_, i) => entryRefs.current[i] ?? createRef<HTMLDivElement>()
    );

    useEffect(() => {
        const currentEntryIndex = transcript.findIndex((entry) => {
            const startSeconds = convertTimeToSeconds(entry.start);
            const endSeconds = convertTimeToSeconds(entry.end);
            return currentTime >= startSeconds && currentTime < endSeconds;
        });

        const currentEntryRef = entryRefs.current[currentEntryIndex];

        if (
            currentEntryIndex !== -1 &&
            currentEntryRef &&
            currentEntryRef.current
        ) {
            currentEntryRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    }, [currentTime, transcript]);

    return (
        <div className="transcript-editor">
            <h1 className="transcript-editor-title">Transcript</h1>
            <div className="transcript-content">
                {transcript.map((entry, index) => (
                    <IndividualTranscriptEntry
                        key={index}
                        start={entry.start}
                        text={entry.text}
                        end={entry.end}
                        currentTime={currentTime}
                        entryRef={entryRefs.current[index]}
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
    entryRef: any;
}

// Each Individual Transcript Entry For TranscriptEditor
const IndividualTranscriptEntry: FC<IndividualTranscriptEntryProps> = ({
    start,
    text,
    end,
    currentTime,
    entryRef,
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

    const formatTime = (timeString: string): string => {
        const totalSeconds = convertTimeToSeconds(timeString);

        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds - hours * 3600) / 60);
        let seconds = Math.floor(totalSeconds - hours * 3600 - minutes * 60);
        console.log(
            totalSeconds +
                " " +
                `${minutes}:${seconds < 10 ? "0" + seconds : seconds}` +
                " " +
                start
        );
        if (hours > 0) {
            return `${hours < 10 ? "0" + hours : hours}:${
                minutes < 10 ? "0" + minutes : minutes
            }:${seconds < 10 ? "0" + seconds : seconds}`;
        } else {
            return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
        }
    };

    return (
        <div
            ref={entryRef}
            className="transcript-entry-container"
            style={{
                background: isCurrentTimeInRange ? "#1f1c18" : "",
            }}
        >
            <div className="time-container">
                <p id="start">{formatTime(start)}</p>
            </div>
            <div className="text-container">
                <input id="text" defaultValue={text} />
            </div>
        </div>
    );
};

const DownloadVideoWithCaptions: FC = () => {
    return (
        <div className="download-video-with-captions-container">
            <button>Download Video With Captions</button>
        </div>
    );
};

const TranslateTranscript: FC = () => {
    return (
        <div className="translate-transcript-container">
            <button>Translate</button>
        </div>
    );
};

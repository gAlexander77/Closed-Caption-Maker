import React, {
    FC,
    useState,
    useEffect,
    useRef,
    createRef,
    useSyncExternalStore,
} from "react";
import {
    BsArrowCounterclockwise,
    BsDownload,
    BsTranslate,
} from "react-icons/bs";
import { ThreeDots } from "react-loader-spinner";
import ReactPlayer from "react-player";
import axios from "axios";
import { supportedLanguages } from "../supportedLanguages";
import "../../../styles/pages/Home/components/VideoAndTranscriptEditor.css";

const API_URL = process.env.REACT_APP_API;

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
    const [transcriptCopy, setTranscriptCopy] =
        useState<TranscriptEntry[]>(transcript);
    const [transcriptHasChanged, setTranscriptHasChanged] =
        useState<boolean>(false);

    useEffect(() => {
        setTranscriptCopy(transcript);
    }, [transcript]);

    useEffect(() => {
        setTranscriptHasChanged(
            JSON.stringify(transcript) !== JSON.stringify(transcriptCopy)
        );
    }, [transcriptCopy]);

    const undoChanges = (): void => {
        setTranscriptCopy([...transcript]);
    };

    useEffect(() => {
        console.log(transcriptCopy);
    });

    const [currentTime, setCurrentTime] = useState(0);
    return (
        <div className="video-and-transcript-editor-component">
            <VideoPlayer
                transcript={transcriptCopy}
                filename={filename}
                setCurrentTime={setCurrentTime}
            />
            <TranscriptEditor
                transcript={transcriptCopy}
                setTranscript={setTranscriptCopy}
                currentTime={currentTime}
                transcriptHasChanged={transcriptHasChanged}
                undoChanges={undoChanges}
            />
            <DownloadVideoWithCaptions
                transcript={transcriptCopy}
                filename={filename}
            />
            <TranslateTranscript
                transcriptCopy={transcriptCopy}
                setTranscriptCopy={setTranscriptCopy}
            />
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
    const [canLoadChanges, setCanLoadChanges] = useState<boolean>(false);

    const convertJsonToWebVTT = (jsonTranscript: any) => {
        let vttString = "WEBVTT\n\n";

        jsonTranscript.forEach((entry: any) => {
            vttString += `${entry.start} --> ${entry.end}\n`;
            vttString += `${entry.text}\n\n`;
        });
        // console.log(vttString);
        return vttString;
    };

    const [subtitlesUrl, setSubtitlesUrl] = useState("");
    const [subtitlesKey, setSubtitlesKey] = useState(0);

    useEffect(() => {
        if (transcript) {
            const webVttString = convertJsonToWebVTT(transcript);
            const blob = new Blob([webVttString], { type: "text/vtt" });
            setSubtitlesUrl(URL.createObjectURL(blob));
            // console.log(subtitlesUrl);
            // setSubtitlesKey((prevKey) => prevKey + 1);
            console.log("Changed");
            setCanLoadChanges(true);
        }
    }, [transcript]);

    const loadChanges = () => {
        setSubtitlesKey((prevKey) => prevKey + 1);
        setCanLoadChanges(false);
    };

    const playerRef = useRef(null);
    const handleProgress = (state: any) => {
        setCurrentTime(state.playedSeconds.toFixed(0));
    };

    useEffect(() => {
        setTimeout(() => {
            loadChanges();
        }, 70);
    }, []);

    return (
        <div className="video-player">
            {canLoadChanges && (
                <button onClick={loadChanges}>Load Transcript Changes</button>
            )}
            <ReactPlayer
                className="react-player"
                key={subtitlesKey}
                ref={playerRef}
                onProgress={handleProgress}
                url={API_URL + "my-video/" + filename}
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
                                label: "Captions",
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
    setTranscript: (transcript: TranscriptEntry[]) => void;
    currentTime: number;
    transcriptHasChanged: boolean;
    undoChanges: any;
}

const TranscriptEditor: FC<TranscriptEditorProps> = ({
    transcript,
    setTranscript,
    currentTime,
    transcriptHasChanged,
    undoChanges,
}) => {
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

    const handleTextChange = (newText: string, start: string, end: string) => {
        const updatedTranscript = transcript.map((entry) => {
            if (entry.start === start && entry.end === end) {
                return { ...entry, text: newText };
            }
            return entry;
        });
        setTranscript(updatedTranscript);
    };

    return (
        <div className="transcript-editor">
            <div className="transcript-editor-header">
                <h1 className="transcript-editor-title">Transcript</h1>
                {transcriptHasChanged ? (
                    <button className="undo-changes-btn" onClick={undoChanges}>
                        <BsArrowCounterclockwise />
                        Undo Changes
                    </button>
                ) : (
                    <div>{transcriptHasChanged}</div>
                )}
            </div>
            <div className="transcript-content">
                {transcript.map((entry, index) => (
                    <IndividualTranscriptEntry
                        key={index}
                        start={entry.start}
                        text={entry.text}
                        end={entry.end}
                        currentTime={currentTime}
                        entryRef={entryRefs.current[index]}
                        onChangeText={handleTextChange}
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
    onChangeText: any;
}

// Each Individual Transcript Entry For TranscriptEditor
const IndividualTranscriptEntry: FC<IndividualTranscriptEntryProps> = ({
    start,
    text,
    end,
    currentTime,
    entryRef,
    onChangeText,
}) => {
    const startTimeInSeconds = convertTimeToSeconds(start);
    const endTimeInSeconds = convertTimeToSeconds(end);

    const isCurrentTimeInRange =
        currentTime >= startTimeInSeconds && currentTime < endTimeInSeconds;

    const formatTime = (timeString: string): string => {
        const totalSeconds = convertTimeToSeconds(timeString);

        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds - hours * 3600) / 60);
        let seconds = Math.floor(totalSeconds - hours * 3600 - minutes * 60);
        // console.log(
        //     totalSeconds +
        //         " " +
        //         `${minutes}:${seconds < 10 ? "0" + seconds : seconds}` +
        //         " " +
        //         start
        // );
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
                <input
                    id="text"
                    value={text}
                    onChange={(e) => onChangeText(e.target.value, start, end)}
                />
            </div>
        </div>
    );
};

interface DownloadVideoWithCaptionsProps {
    transcript: TranscriptEntry[];
    filename: string;
}

const DownloadVideoWithCaptions: FC<DownloadVideoWithCaptionsProps> = ({
    transcript,
    filename,
}) => {
    const [isPreparing, setIsPreparing] = useState<boolean>(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const prepareVideoForDownload = async () => {
        setIsPreparing(true);
        try {
            const endpoint = API_URL + "captions/";
            const data = {
                transcript: transcript,
                filename: filename,
            };
            const response = await axios.post(endpoint, data);
            setDownloadUrl(API_URL + "my-video/" + response.data.video);
            setIsPreparing(false);
        } catch (error) {
            console.error("Error during video preparation:", error);
            setIsPreparing(false);
        }
    };

    const handleDownload = async () => {
        const response = await fetch(downloadUrl ?? "");
        const blob = await response.blob();
        const newDownloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = newDownloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="download-video-with-captions-container">
            {isPreparing ? (
                <>
                    <p>Preparing video for download</p>
                    <ThreeDots
                        height="40"
                        width="40"
                        radius="9"
                        color="white"
                        ariaLabel="three-dots-loading"
                        wrapperStyle={{}}
                        visible={true}
                    />
                </>
            ) : downloadUrl ? (
                <div className="download-btn-container">
                    <button className="download-btn" onClick={handleDownload}>
                        <BsDownload />
                        <p>Download Video</p>
                    </button>
                </div>
            ) : (
                <button
                    className="prepare-video-with-captions-btn"
                    onClick={prepareVideoForDownload}
                >
                    Prepare video with captions for download
                </button>
            )}
        </div>
    );
};

interface TranslateTranscriptProps {
    transcriptCopy: TranscriptEntry[];
    setTranscriptCopy: (transcript: TranscriptEntry[]) => void;
}

const TranslateTranscript: FC<TranslateTranscriptProps> = ({
    transcriptCopy,
    setTranscriptCopy,
}) => {
    const [translatorMenu, setTranstorMenu] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const options: string[] = supportedLanguages;
    const [selectedLanguage, setSelectedLanguage] = useState<string>("english");
    const url = API_URL + "translate/";

    const handleUpload = async () => {
        if (!transcriptCopy) {
            return;
        }

        try {
            const data = {
                transcript: transcriptCopy,
                language: selectedLanguage,
            };
            const response = await axios.post(url, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            console.log("Before update:", transcriptCopy);

            const translated_transcript: TranscriptEntry[] =
                response.data.translated_transcript;
            setTranscriptCopy(translated_transcript);
        } catch (error) {
            let errorMessage = "Failed to upload";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data;
                console.log(errorMessage);
            }
        }
        setLoading(false);
        setTranstorMenu(false);
    };

    return (
        <div className="translate-transcript-container">
            {translatorMenu ? (
                <div className="translate-transcript-menu">
                    {loading ? (
                        <>
                            <p>
                                Translating Transcript to
                                {" " + capitalizeFirstLetter(selectedLanguage)}
                            </p>
                            <ThreeDots
                                height="40"
                                width="40"
                                radius="9"
                                color="white"
                                ariaLabel="three-dots-loading"
                                wrapperStyle={{}}
                                visible={true}
                            />
                        </>
                    ) : (
                        <>
                            <p>Translate to: </p>
                            <select
                                className="select-language"
                                value={selectedLanguage}
                                onChange={(e) =>
                                    setSelectedLanguage(e.target.value)
                                }
                            >
                                {options.map((language, index) => (
                                    <option key={index} value={language}>
                                        {capitalizeFirstLetter(language)}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="translate-btn"
                                onClick={() => {
                                    setLoading(true);
                                    handleUpload();
                                }}
                            >
                                <BsTranslate id="icon" />
                                <>Translate</>
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <button
                    className="open-translator-menu-btn"
                    onClick={() => setTranstorMenu(true)}
                >
                    <BsTranslate />
                    Translate
                </button>
            )}
        </div>
    );
};

// UTILS
const convertTimeToSeconds = (timeString: string): number => {
    const parts = timeString.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);

    return hours * 3600 + minutes * 60 + seconds;
};

const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

import React, { FC, useState, useEffect, useRef, createRef } from "react";
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
    setRoute: (route: string) => void;
}

// Video And Transcript Editor
const VideoAndTranscriptEditor: FC<VideoAndTranscriptEditorProps> = ({
    transcript,
    filename,
    setRoute,
}) => {
    const [transcriptCopy, setTranscriptCopy] =
        useState<TranscriptEntry[]>(transcript);
    const [transcriptHasChanged, setTranscriptHasChanged] =
        useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState(0);

    // Copies the original transcript so
    // it can be edited
    useEffect(() => {
        setTranscriptCopy(transcript);
    }, [transcript]);

    // Compares Current Transcript to Copy to
    // detect any changes
    useEffect(() => {
        setTranscriptHasChanged(
            JSON.stringify(transcript) !== JSON.stringify(transcriptCopy)
        );
    }, [transcriptCopy]);

    // Sets Transcrip Back to original state
    const undoChanges = (): void => {
        setTranscriptCopy([...transcript]);
    };

    // Logging Transcript Changes
    useEffect(() => {
        console.log(transcriptCopy);
    });

    // Sends user to #add-video
    // If the filename or transcript is null
    useEffect(() => {
        setTimeout(() => {
            const transcriptData = sessionStorage.getItem("transcript");
            const filenameData = sessionStorage.getItem("filename");
            console.log(transcriptData);
            console.log(filenameData);
            if (transcriptData === null || filenameData === null) {
                setRoute("add-video");
            }
        }, 100);
    }, []);

    // Stores the maxheight for the transcript editor based on the height of the video player
    const [maxHeight, setMaxHeight] = useState(0);

    return (
        <div className="video-and-transcript-editor-component">
            <VideoPlayer
                transcript={transcriptCopy}
                filename={filename}
                setCurrentTime={setCurrentTime}
                setMaxHeight={setMaxHeight}
            />
            <TranscriptEditor
                transcript={transcriptCopy}
                setTranscript={setTranscriptCopy}
                currentTime={currentTime}
                transcriptHasChanged={transcriptHasChanged}
                undoChanges={undoChanges}
                maxHeight={maxHeight}
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
    setMaxHeight: (maxHeight: number) => void;
}

// Component For Video And Transcript Editor
const VideoPlayer: FC<VideoPlayerProps> = ({
    transcript,
    filename,
    setCurrentTime,
    setMaxHeight,
}) => {
    const [canLoadChanges, setCanLoadChanges] = useState<boolean>(false);
    const [subtitlesUrl, setSubtitlesUrl] = useState("");
    const [subtitlesKey, setSubtitlesKey] = useState(0);
    const playerRef = useRef(null);

    // Sets the current time to the progress of the ReactPlayer
    const handleProgress = (state: any) => {
        setCurrentTime(state.playedSeconds.toFixed(0));
    };

    // Set the transcript to VVT format
    const convertJsonToWebVTT = (jsonTranscript: any) => {
        let vttString = "WEBVTT\n\n";
        jsonTranscript.forEach((entry: any) => {
            vttString += `${entry.start} --> ${entry.end}\n`;
            vttString += `${entry.text}\n\n`;
        });
        return vttString;
    };

    // Creates a VVT Blob for the ReactPlayer
    useEffect(() => {
        if (transcript) {
            const webVttString = convertJsonToWebVTT(transcript);
            const blob = new Blob([webVttString], { type: "text/vtt" });
            setSubtitlesUrl(URL.createObjectURL(blob));
            // console.log(subtitlesUrl);
            // setSubtitlesKey((prevKey) => prevKey + 1);
            // console.log("Changed");
            setCanLoadChanges(true);
        }
    }, [transcript]);

    // Loads transcript to ReactPlayer
    const loadChanges = () => {
        setSubtitlesKey((prevKey) => prevKey + 1);
        setCanLoadChanges(false);
    };

    // Loads Transcript on initial screenload
    useEffect(() => {
        setTimeout(() => {
            loadChanges();
        }, 70);
    }, []);

    const videoPlayer = useRef<HTMLDivElement>(null);

    // Tracks the Height of "video-player"
    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setMaxHeight(entry.target.clientHeight);
            }
        });
        if (videoPlayer.current) {
            resizeObserver.observe(videoPlayer.current);
        }
        return () => {
            if (videoPlayer.current) {
                resizeObserver.unobserve(videoPlayer.current);
            }
        };
    }, []);

    return (
        <div className="video-player" ref={videoPlayer}>
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
    maxHeight: number;
}

const TranscriptEditor: FC<TranscriptEditorProps> = ({
    transcript,
    setTranscript,
    currentTime,
    transcriptHasChanged,
    undoChanges,
    maxHeight,
}) => {
    const entryRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
    entryRefs.current = transcript.map(
        (_, i) => entryRefs.current[i] ?? createRef<HTMLDivElement>()
    );

    // Scrolls to the current transcript entry
    // this is based on the progress of the ReactPlayer
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

    // Handles Changes to the Entries
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
        <div
            className="transcript-editor"
            style={{
                maxHeight: `${maxHeight - 20}px`,
            }}
        >
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
    const startTimeInSeconds: number = convertTimeToSeconds(start);
    const endTimeInSeconds: number = convertTimeToSeconds(end);

    // Check to see the currrent time is within the range of the current entry
    const isCurrentTimeInRange: boolean =
        currentTime >= startTimeInSeconds && currentTime < endTimeInSeconds;

    // Formates time to HH:MM:SS
    const formatTime = (timeString: string): string => {
        const totalSeconds = convertTimeToSeconds(timeString);
        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds - hours * 3600) / 60);
        let seconds = Math.floor(totalSeconds - hours * 3600 - minutes * 60);
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

    // POST /Captions
    // Gets video download with captions burned on video
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

    // Handles the download
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

    // POST /Translate
    // Translates transcript to language selected by the user
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

            // console.log("Before update:", transcriptCopy);

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

import React, { FC, useState, useEffect, useRef, createRef } from "react";
import axios from "axios";
import ReactPlayer from "react-player";
import { ThreeDots } from "react-loader-spinner";
import Dropdown from "react-dropdown";
import { BsArrowCounterclockwise, BsTranslate } from "react-icons/bs";
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
            setSubtitlesKey((prevKey) => prevKey + 1);
        }
    }, [transcript]);

    const playerRef = useRef(null);
    const handleProgress = (state: any) => {
        setCurrentTime(state.playedSeconds.toFixed(0));
    };

    return (
        <div className="video-player">
            {/* <button>Load Transcript Changes</button> */}
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
            // Construct the path to your API endpoint
            const endpoint = API_URL + "captions/"; // Replace with the actual host if different
            const data = {
                transcript: transcript,
                filename: filename,
            };

            // Make the POST request to the Flask server
            const response = await axios.post(endpoint, data);

            // Handle the response here
            console.log("Response:", response.data);
            setDownloadUrl(API_URL + "my-video/" + response.data.video); // Assuming the response contains the path to the video

            setIsPreparing(false); // Reset the preparing state
        } catch (error) {
            console.error("Error during video preparation:", error);
            setIsPreparing(false); // Reset the preparing state even if there's an error
        }
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
                <a
                    href={downloadUrl}
                    className="download-link"
                    download={filename}
                >
                    Download Video
                </a>
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
    const options = ["English", "Spanish"];
    const [selectedLanguage, setSelectedLanguage] = useState<string>("");
    const url = API_URL + "translate/";
    // useEffect(() => {
    //     console.log("TRANSLATE COPY IN FUNCTION");
    //     console.log(transcriptCopy);
    // });

    // useEffect(() => {
    //     console.log("Updated transcriptCopy:", transcriptCopy);
    // }, [transcriptCopy]);

    const handleUpload = async () => {
        if (!transcriptCopy) {
            return;
        }

        try {
            const data = {
                transcript: transcriptCopy, // assuming transcriptCopy is the data you want to send
                language: selectedLanguage, // set the desired language
            };
            const response = await axios.post(
                url,
                data, // sending the JavaScript object as JSON
                {
                    headers: {
                        "Content-Type": "application/json", // explicitly set the content type (Axios usually does this automatically)
                    },
                }
            );

            // sessionStorage.setItem(
            //     "transcript",
            //     JSON.stringify(response.data.translated_transcript)
            // );
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
                            <p>Translating Transcript to {selectedLanguage}</p>
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
                            {/* <Dropdown options={options} /> */}
                            <select
                                value={selectedLanguage}
                                onChange={(e) =>
                                    setSelectedLanguage(e.target.value)
                                }
                            >
                                <option value="english">English</option>
                                <option value="spanish">Spanish</option>
                                <option value="german">German</option>
                                {/* Add more languages as options here */}
                            </select>
                            <button
                                onClick={() => {
                                    setLoading(true);
                                    handleUpload();
                                }}
                            >
                                Translate
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

//

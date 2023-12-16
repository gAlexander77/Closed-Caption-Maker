import React, { FC, useState, useCallback } from "react";
import { BsCameraReelsFill, BsYoutube } from "react-icons/bs";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import "../../../styles/pages/Home/components/VideoSelectionBox.css";

interface TranscriptEntry {
    end: string;
    start: string;
    text: string;
}

interface VideoSelectionBoxProps {
    setRoute: (route: string) => void;
    setTranscript: (transcript: TranscriptEntry[]) => void;
    setFilename: (filenames: string) => void;
}

// Video Selection Box
const VideoSelectionBox: FC<VideoSelectionBoxProps> = ({
    setRoute,
    setTranscript,
    setFilename,
}) => {
    const [isYouTube, setIsYouTube] = useState<boolean>(true);

    return (
        <div className="video-selection-box-component">
            <VideoInputSelection
                setIsYouTube={setIsYouTube}
                isYouTube={isYouTube}
            />
            <div className="content">
                {isYouTube ? (
                    <UploadYoutube
                        setTranscript={setTranscript}
                        setRoute={setRoute}
                        setFilename={setFilename}
                    />
                ) : (
                    <UploadVideo />
                )}
            </div>
        </div>
    );
};

interface VideoInputSelectionProps {
    setIsYouTube: (isYouTube: boolean) => void;
    isYouTube: boolean;
}

// Component For Video Selection Box
const VideoInputSelection: FC<VideoInputSelectionProps> = ({
    setIsYouTube,
    isYouTube,
}) => {
    const selectedStyle = {
        border: "2px solid transparent",
    };

    return (
        <div className="video-input-selection-container">
            <div className="input-selection-container">
                <button
                    style={isYouTube ? {} : selectedStyle}
                    onClick={() => setIsYouTube(true)}
                >
                    <BsYoutube id="icon" />
                    <>YouTube</>
                </button>
            </div>
            <div className="input-selection-container">
                <button
                    style={isYouTube ? selectedStyle : {}}
                    onClick={() => setIsYouTube(false)}
                >
                    <BsCameraReelsFill id="icon" />
                    <>Upload Video</>
                </button>
            </div>
        </div>
    );
};

// Component For Video Selection Box
const UploadVideo: FC = () => {
    const onDrop = useCallback((acceptedFiles: any) => {
        console.log(acceptedFiles);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
    });

    return (
        <div className="upload-video-container">
            <div className="drag-and-drop" {...getRootProps()}>
                <input {...getInputProps()} />
                <h1>Drag and drop video</h1>
                <h1>or</h1>
                <button>Browse Files</button>
            </div>
            <div>
                <button>Upload Video</button>
            </div>
        </div>
    );
};

interface UploadYoutubeProps {
    setRoute: (route: string) => void;
    setTranscript: (transcript: TranscriptEntry[]) => void;
    setFilename: (filename: string) => void;
}

const UploadYoutube: FC<UploadYoutubeProps> = ({
    setTranscript,
    setRoute,
    setFilename,
}) => {
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [uploadStatus, setUploadStatus] = useState("");

    const handleUpload = async () => {
        if (!youtubeUrl) {
            setUploadStatus("Please enter a YouTube URL.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("url", youtubeUrl);

            const response = await axios.post(
                "http://172.16.2.39:5000/video/upload-youtube-video",
                formData
            );
            setUploadStatus(
                `Upload successful. Transcript: ${response.data.transcript}`
            );
            sessionStorage.setItem(
                "transcript",
                JSON.stringify(response.data.transcript)
            );
            sessionStorage.setItem("filename", response.data.filename);
            setTranscript(response.data.transcript);
            setFilename(response.data.filename);
            setRoute("captions-editor");
        } catch (error: any) {
            let errorMessage = "Failed to upload";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data;
            }
            setUploadStatus(`Error: ${errorMessage}`);
        }
    };

    return (
        <div className="upload-youtube-video-container">
            <div className="input-container">
                <h1 id="input-label">YouTube URL</h1>
                <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Enter YouTube URL"
                />
                {uploadStatus && <div>{uploadStatus}</div>}
            </div>
            <button onClick={handleUpload}>Upload YouTube Video</button>
        </div>
    );
};

export default VideoSelectionBox;

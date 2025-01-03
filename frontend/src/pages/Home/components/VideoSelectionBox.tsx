import React, { FC, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ThreeDots } from "react-loader-spinner";
import { BsCameraReelsFill, BsYoutube } from "react-icons/bs";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import "../../../styles/pages/Home/components/VideoSelectionBox.css";

const API_URL = process.env.REACT_APP_API;

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
    console.log(API_URL);
    const [isYouTube, setIsYouTube] = useState<boolean>(false);

    return (
        <motion.div
            className="video-selection-box-component"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ease: "easeOut", duration: 0.8, delay: 0.1 }}
        >
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
                    <UploadVideo
                        setTranscript={setTranscript}
                        setRoute={setRoute}
                        setFilename={setFilename}
                    />
                )}
            </div>
        </motion.div>
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

interface UploadVideoProps {
    setRoute: (route: string) => void;
    setTranscript: (transcript: TranscriptEntry[]) => void;
    setFilename: (filename: string) => void;
}

// Component For Video Selection Box
const UploadVideo: FC<UploadVideoProps> = ({
    setTranscript,
    setRoute,
    setFilename,
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [videoFile, setVideoFile] = useState<any>(null);

    const onDrop = useCallback((acceptedFiles: any) => {
        const file = acceptedFiles[0];
        if (file && file.type === "video/mp4") {
            setVideoFile(file);
            console.log("File accepted:", file);
        } else {
            alert("Only .MP4 files are allowed.");
            console.error("File rejected. Only .MP4 files are allowed.");
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
    });

    const uploadFile = async () => {
        if (!videoFile) {
            alert("Please select a file to upload");
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append("file", videoFile);

        try {
            const response = await axios.post(
                `${API_URL}video/upload-video`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            // Handle the response from the server
            console.log("Response:", response.data);
            if (response.data.transcript) {
                setTranscript(response.data.transcript);
                setFilename(response.data.filename);
                setRoute("captions-editor");
                sessionStorage.setItem(
                    "transcript",
                    JSON.stringify(response.data.transcript)
                );
                sessionStorage.setItem("filename", response.data.filename);
            }

            setIsLoading(false);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(
                    "Upload error:",
                    error.response?.data || error.message
                );
            } else {
                console.error("An unexpected error occurred", error);
            }
        }
    };

    return (
        <div className="upload-video-container">
            {isLoading ? (
                <div className="loading-container">
                    <p>Uploading Video and Generating Transcript</p>
                    <ThreeDots
                        height="40"
                        width="40"
                        radius="9"
                        color="white"
                        ariaLabel="three-dots-loading"
                        wrapperStyle={{}}
                        visible={true}
                    />
                </div>
            ) : (
                <div className="drag-and-drop" {...getRootProps()}>
                    <input {...getInputProps()} />
                    <div className="border"></div>
                    <h1 id="text">Drag and drop video</h1>
                    <h1 id="text">or</h1>
                    <button className="browse-btn">Browse Files</button>
                    <div className="border">
                        {videoFile && (
                            <p className="video-name">{videoFile.name}</p>
                        )}
                    </div>
                </div>
            )}
            <div className="upload-video-btn-container">
                <button
                    className="upload-video-btn"
                    onClick={uploadFile}
                    disabled={isLoading}
                >
                    Upload Video
                </button>
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
    const [isPosting, setIsPosting] = useState(false);

    const handleUpload = async () => {
        if (!youtubeUrl) {
            setUploadStatus("Please enter a YouTube URL.");
            console.log("Please enter a YouTube URL");
            setIsPosting(false);
            return;
        }

        try {
            const url = API_URL + "video/upload-youtube-video";

            const formData = new FormData();
            formData.append("url", youtubeUrl);

            const response = await axios.post(url, formData);
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
            setIsPosting(false);
        } catch (error: any) {
            let errorMessage = "Failed to upload";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data;
            }
            setUploadStatus(`Error: ${errorMessage}`);
            setIsPosting(false);
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
                <div className="status-container">
                    {isPosting ? (
                        <>
                            <p>Generating Transcript</p>
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
                        <p style={{ color: "red" }}>{uploadStatus}</p>
                    )}
                </div>
            </div>
            <button
                disabled={isPosting}
                onClick={() => {
                    setIsPosting(true);
                    handleUpload();
                }}
            >
                Upload YouTube Video
            </button>
        </div>
    );
};

export default VideoSelectionBox;

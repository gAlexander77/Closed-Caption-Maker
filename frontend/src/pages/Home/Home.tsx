import React, { FC, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Welcome from "./components/Welcome";
import VideoSelectionBox from "./components/VideoSelectionBox";
import VideoAndTranscriptEditor from "./components/VideoAndTranscriptEditor";
import "../../styles/pages/Home/Home.css";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

interface TranscriptEntry {
    end: string;
    start: string;
    text: string;
}

const Home: FC = () => {
    const initialTranscript: TranscriptEntry[] = [
        {
            end: "",
            start: "",
            text: "",
        },
    ];

    const location = useLocation();

    const [route, setRoute] = useState<string>(
        window.location.hash.replace("#", "")
    );
    const [transcript, setTranscript] =
        useState<TranscriptEntry[]>(initialTranscript);
    const [filename, setFilename] = useState<string>("");

    useEffect(() => {
        window.location.hash = "#" + route;
    }, [route]);

    useEffect(() => {
        const currentHash = window.location.hash.replace("#", "");
        const validHashes = ["welcome", "add-video", "captions-editor"];
        if (validHashes.includes(currentHash)) {
            setRoute(currentHash);
        } else {
            setRoute(validHashes[0]);
        }
    }, [location]);

    useEffect(() => {
        const transcriptData = sessionStorage.getItem("transcript");
        const filenameData = sessionStorage.getItem("filename");

        if (transcriptData) {
            setTranscript(JSON.parse(transcriptData));
        }
        if (filenameData) {
            setFilename(filenameData);
        }
    }, []);

    // -------------CONSOLE LOGS FOR DEBUGGING--------------
    useEffect(() => {
        console.log("Transcript updated");
        console.log(transcript);
    }, [transcript]);
    useEffect(() => {
        console.log("Filename updated:", filename);
    }, [filename]);
    // -----------------------------------------------------

    return (
        <>
            <Header />
            <div className="home-page">
                {route === "welcome" ? <Welcome setRoute={setRoute} /> : null}
                {route === "add-video" ? (
                    <VideoSelectionBox
                        setRoute={setRoute}
                        setTranscript={setTranscript}
                        setFilename={setFilename}
                    />
                ) : null}
                {route === "captions-editor" ? (
                    <VideoAndTranscriptEditor
                        transcript={transcript}
                        filename={filename}
                        setRoute={setRoute}
                    />
                ) : null}
            </div>
            <Footer />
        </>
    );
};

export default Home;

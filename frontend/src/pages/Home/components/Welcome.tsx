import React, { FC } from "react";
import "../../../styles/pages/Home/components/Welcome.css";
import backgroundVideo from "../../../assets/welcome.mp4";

interface WelcomeProps {
    setRoute: (route: string) => void;
}

const Welcome: FC<WelcomeProps> = ({ setRoute }) => {
    const handleClick = () => {
        setRoute("add-video");
    };

    return (
        <div className="welcome-container">
            {/* <video autoPlay loop muted className="background-video">
                <source
                    src={backgroundVideo}
                    type="video/mp4"
                    style={{ all: "unset" }}
                />
                Your browser does not support the video tag.
            </video> */}
            <h1>Welcome</h1>
            <h1>Translate and add closed captions here</h1>
            <button onClick={handleClick}>Get Started</button>
        </div>
    );
};

export default Welcome;

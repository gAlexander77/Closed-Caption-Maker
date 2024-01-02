import React, { FC } from "react";
import "../../../styles/pages/Home/components/Welcome.css";
import background from "../../../assets/background.jpg";

interface WelcomeProps {
    setRoute: (route: string) => void;
}

const Welcome: FC<WelcomeProps> = ({ setRoute }) => {
    const handleClick = () => {
        setRoute("add-video");
    };

    return (
        <>
            <div className="welcome-background-container">
                <div className="background-filter"></div>
                <img className="background-image" src={background}></img>
            </div>
            <div className="welcome-container">
                <h1>Welcome</h1>
                <h1>Translate and add closed captions here</h1>
                <button onClick={handleClick}>Get Started</button>
            </div>
        </>
    );
};

export default Welcome;

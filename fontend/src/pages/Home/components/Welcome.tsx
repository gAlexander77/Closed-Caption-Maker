import React, { FC } from "react";
import "../../../styles/pages/Home/components/Welcome.css";
interface WelcomeProps {
    setRoute: (route: string) => void;
}

const Welcome: FC<WelcomeProps> = ({ setRoute }) => {
    const handleClick = () => {
        setRoute("add-video");
    };

    return (
        <div className="welcome-container">
            <h1>Welcome</h1>
            <h1>Translate and add closed captions here</h1>
            <button onClick={handleClick}>Get Started</button>
        </div>
    );
};

export default Welcome;

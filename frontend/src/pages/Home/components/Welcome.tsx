import React, { FC } from "react";
import { motion } from "framer-motion";
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
                <img
                    className="background-image"
                    src={background}
                    alt="background"
                ></img>
            </div>
            <div className="welcome-container">
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ ease: "easeOut", duration: 0.5, delay: 0.2 }}
                >
                    Welcome to Closed Caption Maker
                </motion.h1>
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ ease: "easeOut", duration: 0.5, delay: 0.5 }}
                >
                    Translate Videos and add Subtitles
                </motion.h1>

                <motion.button
                    onClick={handleClick}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ ease: "easeOut", duration: 0.5, delay: 0.8 }}
                >
                    Get Started
                </motion.button>
            </div>
        </>
    );
};

export default Welcome;

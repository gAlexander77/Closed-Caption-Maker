import React from "react";
import { BsGithub } from "react-icons/bs";
import "../styles/components/Footer.css";

const Footer = () => {
    const currentYear: number = new Date().getFullYear();
    const sourceCodeLink: string =
        "https://github.com/gAlexander77/Closed-Caption-Maker";

    return (
        <div className="footer-component">
            <div className="footer-content">
                <a
                    className="source-code-link"
                    href={sourceCodeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <BsGithub />
                    Source Code
                </a>
                <p className="copyright">
                    ©{currentYear} Closed Caption Maker | Made by Alexander
                    Martinez
                </p>
            </div>
        </div>
    );
};

export default Footer;

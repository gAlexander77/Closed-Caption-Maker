import React from "react";
import "../styles/components/Header.css";

const Header = () => {
    return (
        <div className="header-component">
            <a href="/#welcome" className="header-link">
                <h1>Closed Caption Maker</h1>
            </a>
        </div>
    );
};

export default Header;

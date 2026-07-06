import React, { useState, useEffect } from "react";

const RightBar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleBar = () => {
        setIsCollapsed((prev) => !prev);
    };

    // Update CSS variable on state change
    useEffect(() => {
        document.documentElement.style.setProperty(
            "--right-bar-width",
            isCollapsed ? "50px" : "19.7vw"
        );
    }, [isCollapsed]);

    return (
        <aside className={`right-bar ${isCollapsed ? "collapsed" : ""}`}>
            <button className="toggle-button" onClick={toggleBar}>
                <i className={`fas ${isCollapsed ? "fa-chevron-left" : "fa-chevron-right"}`}></i>
            </button>
            {!isCollapsed && <></>}
        </aside>
    );
};

export default RightBar;

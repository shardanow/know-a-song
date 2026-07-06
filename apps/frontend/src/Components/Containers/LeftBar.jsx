import React, { useState, useEffect } from "react";
import LeftMenu from "../Menu/LeftMenu";
import UserInfoSmall from "../User/UserInfoSmall";

const LeftBar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleBar = () => {
        setIsCollapsed((prev) => !prev);
    };

    // Update CSS variable on state change
    useEffect(() => {
        document.documentElement.style.setProperty(
            "--left-bar-width",
            isCollapsed ? "50px" : "19.7vw"
        );
    }, [isCollapsed]);

    return (
        <aside className={`left-bar ${isCollapsed ? "collapsed" : ""}`}>
            <button className="toggle-button" onClick={toggleBar}>
                <i className={`fas ${isCollapsed ? "fa-chevron-right" : "fa-chevron-left"}`}></i>
            </button>
            {!isCollapsed && (
                <>
                    <LeftMenu />
                    <UserInfoSmall />
                </>
            )}
        </aside>
    );
};

export default LeftBar;

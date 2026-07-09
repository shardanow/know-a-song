import React from "react";

const Copyright = () => {
    const getYear = () => {
        return new Date().getFullYear();
    };

    return (
        <span className="copyright">
            &copy; Know A Song 2022 - {getYear()}
        </span>
    );
};

export default Copyright;
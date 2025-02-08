import React from "react";

const Logo = () => {
    return (
        <picture className="main-logo">
            <svg width="200" height="50" viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="50" fill="#202020" />
                <text x="10" y="35" font-family="Roboto, sans-serif" font-size="24" fill="#ff6b6b">Know A Song</text>
                <circle cx="180" cy="25" r="15" fill="#ff6b6b" />
                <polygon points="175,20 185,25 175,30" fill="#202020" />
            </svg>
        </picture>
    );
};

export default Logo;
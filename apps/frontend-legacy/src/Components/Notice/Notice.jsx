import React, { useEffect } from "react";
import '../../content/styles/notice.scss'

const Notice = ({ title, text }) => {
    useEffect(() => {
        const hideNotice = () => {
            setTimeout(() => {
                // eslint-disable-next-line
                document.querySelector('.notice').style.display = 'none';
            }, 3000);
        };

        hideNotice();
    }, []);

    return (
        <aside className="notice">
            <b className="notice-title">{title}</b>
            <p className="notice-text">{text}</p>
        </aside>
    );
};

export default Notice;
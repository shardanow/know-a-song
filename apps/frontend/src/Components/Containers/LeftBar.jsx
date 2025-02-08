import React from "react";
import LeftMenu from "../Menu/LeftMenu";
import UserInfoSmall from "../User/UserInfoSmall";

const LeftBar = () => {
    return (
        <aside className="left-bar">
            <LeftMenu/>
            <UserInfoSmall/>
        </aside>
    );
};

export default LeftBar;
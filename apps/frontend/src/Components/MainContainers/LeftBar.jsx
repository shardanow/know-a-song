import React from "react";
import LeftMenu from "../Menu/LeftMenu";
import UserInfoSmall from "../User/UserInfoSmall";

class LeftBar extends React.Component{

    render() {
        return (
            <aside className="left-bar">
                <LeftMenu/>
                <UserInfoSmall/>
            </aside>
        );
    }
}

export default LeftBar;
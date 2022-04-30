import React from "react";
import Logo from "../Header/Logo";

class LeftMenu extends React.Component{

    render() {
        return (
            <section className="left-menu">
                <Logo/>
            </section>
        );
    }
}

export default LeftMenu;
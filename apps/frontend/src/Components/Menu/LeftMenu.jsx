import React from "react";
import { Link } from "react-router-dom";
import Logo from "../Header/Logo";

const LeftMenu = () => {
    return (
        <section className="left-menu">
            <Logo />
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/films">Films</Link></li>
                </ul>
            </nav>
        </section>
    );
};

export default LeftMenu;
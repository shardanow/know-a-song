import React from "react";
import { Link } from "react-router-dom";
import Logo from "../Header/Logo";

const LeftMenu = () => {
    return (
        <section className="left-menu">
            <Logo />
            <nav>
                <ul>
                    <li>
                        <Link to="/">
                            <i className="fas fa-home menu-icon"></i> Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/films">
                            <i className="fas fa-film menu-icon"></i> Films
                        </Link>
                    </li>
                </ul>
            </nav>
        </section>
    );
};

export default LeftMenu;
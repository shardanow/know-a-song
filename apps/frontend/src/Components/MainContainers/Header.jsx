import React from "react";
import SearchBar from "../Search/SearchBar";

class Header extends React.Component{

    render() {
        return (
            <header className="header">
               <SearchBar/>
            </header>
        );
    }
}

export default Header;
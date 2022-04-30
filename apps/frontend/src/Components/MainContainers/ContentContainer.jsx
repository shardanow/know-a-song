import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Film from "../../Pages/Film";

class ContentContainer extends React.Component{

    render() {
        return (
            <main className="content-container">
                <Header/>
                    <Film/>
                <Footer/>
            </main>
        );
    }
}

export default ContentContainer;
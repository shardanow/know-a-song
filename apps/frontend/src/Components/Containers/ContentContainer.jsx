import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const ContentContainer = ({ ContainerComponent }) => {
    return (
        <main className="content-container">
            <Header/>
            {ContainerComponent && <ContainerComponent />}
            <Footer/>
        </main>
    );
};

export default ContentContainer;

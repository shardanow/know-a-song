import React from "react";
import LeftBar from "../Components/MainContainers/LeftBar";
import RightBar from "../Components/MainContainers/RightBar";
import ContentContainer from "../Components/MainContainers/ContentContainer";

const Home = () => {
    return (
        <section className="main-container">
            <LeftBar/>
            <ContentContainer/>
            <RightBar/>
        </section>
    );
};

export default Home;
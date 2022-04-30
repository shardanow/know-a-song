import React from "react";
import LeftBar from "../Components/MainContainers/LeftBar";
import RightBar from "../Components/MainContainers/RightBar";
import ContentContainer from "../Components/MainContainers/ContentContainer";

class Home extends React.Component{

    render() {
        return (
            <section className="main-container">
                <LeftBar/>
                <ContentContainer/>
                <RightBar/>
            </section>
        );
    }
}

export default Home;
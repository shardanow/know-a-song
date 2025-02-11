import React, { useState } from "react";
import LeftBar from "../Components/Containers/LeftBar";
import RightBar from "../Components/Containers/RightBar";

const Home = () => {
    
    return (
        <section className="main-container">
            <LeftBar />

            <RightBar />
        </section>
    );
};

export default Home;
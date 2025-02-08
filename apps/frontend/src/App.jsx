import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Film from "./Pages/Films";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/films" element={<Film />} />
                // add a new route for the film detail page and pass the id as a parameter
                <Route path="/film/:id" element={<Film />} />
            </Routes>
        </Router>
    );
};

export default App;

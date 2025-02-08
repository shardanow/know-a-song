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
                <Route path="/film/:type/:id" element={<Film />} />
            </Routes>
        </Router>
    );
};

export default App;

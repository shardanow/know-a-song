import React from 'react';
import './content/styles/main.scss'
import Home from "./Pages/Home";
//film page
import Film from "./Pages/Film";


import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    //<React.StrictMode>
        // <Home tab="home" />
        <Film tab="film" />
   // </React.StrictMode>
);
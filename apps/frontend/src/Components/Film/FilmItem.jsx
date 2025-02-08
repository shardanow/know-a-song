import React, { useState, useEffect, useCallback } from "react";
import Player from "../Song/Player";
import SongList from "../Song/SongList";
import FilmInfo from "./FilmInfo";
import getFilmInfo from "../../Services/API/getFilmInfo";

const FilmItem = ({ filmID }) => {
    const [filmTitle, setFilmTitle] = useState(null);
    const [filmYear, setFilmYear] = useState(null);
    const [filmBackground, setFilmBackground] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const [currentSongTitle, setCurrentSongTitle] = useState(null);
    const [error, setError] = useState(null);

    const playSelectedSong = useCallback((item, songTitle) => {
        setCurrentSong(item);
        setCurrentSongTitle(songTitle);
        console.log('new song - ' + item, ' state song - ' + currentSong);
    }, [currentSong]);

    useEffect(() => {
        const fetchFilmInfo = async () => {
            try {
                if (filmID) {
                    let filmInfoData = await getFilmInfo(filmID);

                    setFilmTitle(filmInfoData.name || filmInfoData.title);
                    setFilmYear(new Date(filmInfoData.first_air_date || filmInfoData.release_date).getFullYear());
                    setFilmBackground('https://image.tmdb.org/t/p/original/' + filmInfoData.backdrop_path);
                    setIsLoaded(true);
                }

            } catch (e) {
                console.error(e);
                setError('Failed to fetch film information.');
            }
        };

        fetchFilmInfo();
    }, [filmID]);

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!isLoaded) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <section className="film">
            <FilmInfo filmInfo={{ filmTitle, filmYear, filmBackground, isLoaded }} />
            <SongList playItem={playSelectedSong} currentSong={currentSong} />
            <Player currentSong={currentSong} currentSongTitle={currentSongTitle} />
        </section>
    );
};

export default FilmItem;
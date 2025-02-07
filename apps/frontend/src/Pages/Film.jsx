import React, { useState, useEffect, useCallback } from "react";
import Player from "../Components/Song/Player";
import SongList from "../Components/Song/SongList";
import FilmInfo from "../Components/Film/FilmInfo";
import filmInfo from "../Services/API/getFilmInfo";
import '../content/styles/film.scss';
import '../content/styles/songs.scss';
import '../content/styles/player.scss';

const Film = () => {
    const [data, setData] = useState(null);
    const [filmTitle, setFilmTitle] = useState(null);
    const [filmYear, setFilmYear] = useState(null);
    const [filmBackground, setFilmBackground] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const [currentSongTitle, setCurrentSongTitle] = useState(null);

    const playSelectedSong = useCallback((item, songTitle) => {
        setCurrentSong(item);
        setCurrentSongTitle(songTitle);
        console.log('new song - ' + item, ' state song - ' + currentSong);
    }, [currentSong]);

    useEffect(() => {
        const fetchFilmInfo = async () => {
            try {
                let filmInfoData = await filmInfo(45247);

                setFilmTitle(filmInfoData.name);
                setFilmYear(new Date(filmInfoData.first_air_date).getFullYear());
                setFilmBackground('https://image.tmdb.org/t/p/original/' + filmInfoData.backdrop_path);
                setIsLoaded(true);
            } catch (e) {
                console.error(e);
            }
        };

        fetchFilmInfo();
    }, []);

    return (
        <section className="film">
            <FilmInfo filmInfo={{ data, filmTitle, filmYear, filmBackground, isLoaded }} />
            <SongList playItem={playSelectedSong} currentSong={currentSong} />
            <Player currentSong={currentSong} currentSongTitle={currentSongTitle} />
        </section>
    );
};

export default Film;
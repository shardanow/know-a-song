import React, { useState, useEffect, useCallback } from "react";
import Player from "../Song/Player";
import SongList from "../Song/SongList";
import FilmInfo from "./FilmInfo";
import getFilmInfo from "../../Services/API/getFilmInfo";
import getFilmSongs from "../../Services/API/getFilmSongs";

const FilmItem = ({ filmID, type }) => {
    const [filmTitle, setFilmTitle] = useState(null);
    const [filmYear, setFilmYear] = useState(null);
    const [filmBackground, setFilmBackground] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const [currentSongTitle, setCurrentSongTitle] = useState(null);
    const [songs, setSongs] = useState([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(null);

    const playSelectedSong = useCallback((item, songTitle) => {
        if (item === currentSong) {
            setIsPlaying(!isPlaying);
        } else {
            setCurrentSong(item);
            setCurrentSongTitle(songTitle);
            setCurrentSongIndex(songs.findIndex(song => song.youtube_id === item));
            setIsPlaying(true);
        }
        console.log('new song - ' + item, ' state song - ' + currentSong);
    }, [currentSong, songs, isPlaying]);

    useEffect(() => {
        const fetchFilmInfo = async () => {
            try {
                if (filmID) {
                    let filmInfoData = await getFilmInfo(filmID, type);

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
    }, [filmID, type]);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const songsData = await getFilmSongs(filmID);
                setSongs(songsData);
            } catch (e) {
                console.error(e);
                setError('Failed to fetch songs.');
            }
        };

        fetchSongs();
    }, [filmID]);

    useEffect(() => {
        if (songs.length > 0) {
            setCurrentSong(songs[currentSongIndex].youtube_id);
            setCurrentSongTitle(songs[currentSongIndex].author + ' - ' + songs[currentSongIndex].title);
        }
    }, [currentSongIndex, songs]);

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!isLoaded) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <section className="film">
            <FilmInfo filmInfo={{ filmTitle, filmYear, filmBackground, isLoaded }} />
            <SongList playItem={playSelectedSong} currentSong={currentSong} songs={songs} isPlaying={isPlaying} />
            <Player
                currentSong={currentSong}
                currentSongTitle={currentSongTitle}
                songs={songs}
                currentSongIndex={currentSongIndex}
                setCurrentSongIndex={setCurrentSongIndex}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
            />
        </section>
    );
};

export default FilmItem;
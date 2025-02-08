import React, { useState, useEffect } from "react";
import getFilmSongs from "../../Services/API/getFilmSongs";
import SongItem from "./SongItem";
import '../../content/styles/songs.scss';

const SongList = ({ playItem, currentSong, filmId, setSongs, isPlaying }) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const songs = await getFilmSongs(filmId);
                setData(songs);
                setSongs(songs);
            } catch (error) {
                console.error('Error fetching songs:', error);
                setError('Failed to fetch songs.');
            }
        };

        fetchSongs();
    }, [filmId, setSongs]);

    if (error) {
        return <div className="error">{error}</div>;
    }

    const songsList = data.map(item => (
        <SongItem
            playItem={playItem}
            currentSong={currentSong}
            id={item.youtube_id}
            key={item.id}
            songAuthor={item.author}
            songTitle={item.title}
            isPlaying={isPlaying}
        />
    ));

    return (
        <section className="song-list">
            <div className="list-top">
                <h2 className="song-list-title">Playlist</h2>
                <div className="list-counter">
                    <i className="fas fa-list"></i>
                    <b className="list-count">{data.length}</b>
                </div>
            </div>
            {songsList}
        </section>
    );
};

export default SongList;
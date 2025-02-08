import React from "react";
import SongItem from "./SongItem";
import '../../content/styles/songs.scss';

const SongList = ({ playItem, currentSong, songs, isPlaying }) => {
    if (!songs.length) {
        return <div className="error">No songs available.</div>;
    }

    const songsList = songs.map(item => (
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
                    <b className="list-count">{songs.length}</b>
                </div>
            </div>
            {songsList}
        </section>
    );
};

export default SongList;
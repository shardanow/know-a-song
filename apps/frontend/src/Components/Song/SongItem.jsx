import React from "react";

const SongItem = ({ id, currentSong, playItem, songAuthor, songTitle, isPlaying }) => {
    return (
        <div className={`song-item ${id === currentSong ? "song-item--active" : ""}`}>
            <div className="left-side">
                <i
                    className={`fas ${id === currentSong && isPlaying ? "fa-pause-circle" : "fa-play-circle"} play-icon`}
                    onClick={() => playItem(id, `${songAuthor} - ${songTitle}`)}
                ></i>
                <span className="song-title"><b className="song-author">{songAuthor}</b> - {songTitle}</span>
            </div>

            <div className="right-side">
                <div className="left-buttons">
                    <i className="fab fa-apple"></i>
                    <i className="fab fa-spotify"></i>
                    <i className="fab fa-youtube"></i>
                </div>
                <div className="right-buttons">
                    <i className="fas fa-heart"></i>
                    <i className="fas fa-thumbs-up"></i>
                    <i className="fas fa-thumbs-down"></i>
                </div>
            </div>
        </div>
    );
};

export default SongItem;
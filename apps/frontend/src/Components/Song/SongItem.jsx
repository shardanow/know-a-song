import React from "react";

const SongItem = ({ id, currentSong, playItem, songAuthor, songTitle, isPlaying, youtubeLink, isOpening, isEnding, repetitions }) => {
    const repetitionHint = repetitions
        ? `Repeats in: \n Seasons: ${[...new Set(repetitions.map(r => r.season))].join(', ')} \n Episodes: ${repetitions.map(r => r.episode).join(', ')}`
        : '';

    return (
        <div className={`song-item ${id === currentSong ? "song-item--active" : ""}`}>
            <div className="left-side">
                <i
                    className={`fas ${id === currentSong && isPlaying ? "fa-pause-circle" : "fa-play-circle"} play-icon`}
                    onClick={() => playItem(id, `${songAuthor} - ${songTitle}`)}
                ></i>
                <span className="song-title">
                    <b className="song-author">{songAuthor}</b> - {songTitle}
                    {isOpening && <span className="song-label song-label--opening">Opening</span>}
                    {isEnding && <span className="song-label song-label--ending">Ending</span>}
                    {repetitions && (
                        <span className="repetition-icon-wrapper">
                            <i className="fas fa-sync-alt repetition-icon"></i>
                            <span className="repetition-hint">{repetitionHint}</span>
                        </span>
                    )}
                </span>
            </div>

            <div className="right-side">
                <div className="left-buttons">
                    <i className="fab fa-apple"></i>
                    <i className="fab fa-spotify"></i>
                    <a href={youtubeLink} target="_blank" rel="noreferrer">
                        <i className="fab fa-youtube"></i>
                    </a>
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
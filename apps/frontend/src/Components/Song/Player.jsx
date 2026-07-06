import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactPlayer from "react-player";
import Notice from "../Notice/Notice";
import '../../content/styles/player.scss';

const Player = ({ currentSong, currentSongTitle, songs, currentSongIndex, setCurrentSongIndex, isPlaying, setIsPlaying }) => {
    const [currentPosition, setCurrentPosition] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [volume, setVolume] = useState(1);
    const [prevVolume, setPrevVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const playerRef = useRef(null);

    const playSong = useCallback(() => {
        setIsPlaying(true);
    }, [setIsPlaying]);

    useEffect(() => {
        if (currentSong && isPlaying) {
            playSong();
        }
    }, [currentSong, isPlaying, playSong]);

    const playToggleSong = () => {
        setIsPlaying(prev => !prev);
    };

    const progressStatus = (status) => {
        if (!seeking) {
            setCurrentPosition(status.played);
        }
    };

    const setPlayTime = (e) => {
        const newTime = parseFloat(e.target.value);
        playerRef.current.seekTo(newTime, 'fraction');
        setCurrentPosition(newTime);
    };

    const getSongTime = () => {
        if (playerRef.current) {
            const duration = playerRef.current.getDuration();
            const currentTime = playerRef.current.getCurrentTime();

            if (!isNaN(duration)) {
                const totalMinutes = Math.floor(duration / 60);
                const totalSeconds = String(Math.round(duration % 60)).padStart(2, '0');
                const currentMinutes = Math.floor(currentTime / 60);
                const currentSeconds = String(Math.round(currentTime % 60)).padStart(2, '0');

                return `${currentMinutes}:${currentSeconds} / ${totalMinutes}:${totalSeconds}`;
            }
        }
        return "0:00 / 0:00";
    };

    const handleSongEnd = () => {
        if (isLooping) {
            playerRef.current.seekTo(0);
        } else {
            setCurrentSongIndex((currentSongIndex + 1) % songs.length);
        }
    };

    const toggleMute = () => {
        if (isMuted) {
            setVolume(prevVolume);
        } else {
            setPrevVolume(volume);
            setVolume(0);
        }
        setIsMuted(!isMuted);
    };

    const toggleLoop = () => {
        setIsLooping(!isLooping);
    };

    useEffect(() => {
        setIsLoading(false);
    }, [currentSong]);

    const handleError = (e) => {
        setError("An error occurred while playing the song.");
        setIsPlaying(false);
    };

    if (songs.length === 0) {
        return null; // Do not render Player if no songs
    }

    return (
        <section className="player">
            {isLoading && <div className="loading-message">Loading...</div>}
            {error && <Notice title="Error" text={error} />}
            <ReactPlayer
                ref={playerRef}
                className="player-integration"
                url={`https://www.youtube.com/watch?v=${currentSong}`}
                playing={isPlaying}
                volume={volume}
                muted={isMuted}
                onProgress={progressStatus}
                progressInterval={500}
                onEnded={handleSongEnd}
                onError={handleError}
            />

            <section className="player-manipulation">
                <section className="player-left-part">
                    <div className="control" onClick={playToggleSong}>
                        <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} play-icon`}></i>
                    </div>

                    <picture>
                        <img src={`https://img.youtube.com/vi/${currentSong}/mqdefault.jpg`} alt="player" />
                    </picture>
                </section>

                <section className="player-right-part">
                    <div className="top-controls">
                        <span>{currentSongTitle}</span>
                        <div className="volume-control">
                            <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} volume-icon`} onClick={toggleMute}></i>
                            <input
                                className="player-volume-bar"
                                type="range"
                                max={1}
                                step="any"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="bottom-controls">
                        <i className="fas fa-step-backward control-icon" onClick={() => setCurrentSongIndex(currentSongIndex > 0 ? currentSongIndex - 1 : songs.length - 1)}></i>
                        <i className={`fas fa-sync-alt control-icon ${isLooping ? "active" : ""}`} onClick={toggleLoop}></i>
                        <i className="fas fa-step-forward control-icon" onClick={() => setCurrentSongIndex((currentSongIndex + 1) % songs.length)}></i>
                        <input
                            className="player-seek-bar"
                            onMouseDown={() => setSeeking(true)}
                            onMouseUp={() => setSeeking(false)}
                            onChange={setPlayTime}
                            type="range"
                            max={0.999999}
                            step="any"
                            value={currentPosition}
                        />
                        <span>{getSongTime()}</span>
                    </div>
                </section>
            </section>
        </section>
    );
};

export default Player;
import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactPlayer from "react-player";
import Notice from "../Notice/Notice";

const Player = ({ currentSong, currentSongTitle }) => {
    const [play, setPlay] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [volume, setVolume] = useState(1);
    const playerRef = useRef(null);

    const playSong = useCallback(() => {
        setPlay(true);
        console.log('Playing song - ' + currentSong);
    }, [currentSong]);

    useEffect(() => {
        if (currentSong) {
            playSong();
        }
    }, [currentSong, playSong]);

    const playToggleSong = () => {
        setPlay(!play);
    };

    const progressStatus = (status) => {
        if (!seeking) {
            setCurrentPosition(status.played);
        }
    };

    const setPlayTime = (element) => {
        playerRef.current.seekTo(parseFloat(element.target.value), 'fraction');
        setCurrentPosition(parseFloat(element.target.value));
    };

    const getSongTime = () => {
        if (playerRef.current) {
            const totalMinutes = Math.floor(playerRef.current.getDuration() / 60);
            const totalSeconds = ("0" + Math.round(playerRef.current.getDuration() - totalMinutes * 60)).slice(-2);
            const currentMinutes = Math.floor(playerRef.current.getCurrentTime() / 60);
            const currentSeconds = ("0" + Math.round(playerRef.current.getCurrentTime() - currentMinutes * 60)).slice(-2);

            return !isNaN(totalMinutes) ? `${currentMinutes}:${currentSeconds} / ${totalMinutes}:${totalSeconds}` : "0:00 / 0:00";
        }
    };

    if (currentSong && ReactPlayer.canPlay("https://youtu.be/" + currentSong)) {
        return (
            <section className="player">
                <ReactPlayer
                    ref={playerRef}
                    className="player-integration"
                    url={"https://youtu.be/" + currentSong}
                    playing={play}
                    volume={volume}
                    onProgress={progressStatus}
                    progressInterval={500}
                />

                <section className="player-manipulation">
                    <section className="player-left-part">
                        <div id="control" className={play ? "is--playing" : ""} onClick={playToggleSong}>
                            <div className="border"></div>
                            <div className="play"></div>
                        </div>

                        <picture>
                            <img src={"https://img.youtube.com/vi/" + currentSong + "/mqdefault.jpg"} alt="player" />
                        </picture>
                    </section>

                    <section className="player-right-part">
                        <div className="top-controls">
                            <span>{currentSongTitle}</span>
                            <div className="volume-control">
                                <svg xmlns="http://www.w3.org/2000/svg" width="23.125" height="25" viewBox="0 0 23.125 25">
                                    <path id="audio" d="M17.536,6a8.379,8.379,0,0,1,0,15.531V23.28a10.022,10.022,0,0,0,0-19.03V6Zm0,4.124a4.8,4.8,0,0,1,0,7.284v1.778a6.26,6.26,0,0,0,0-10.837v1.777ZM3.161,18.774h5l5.625,6.884a1.447,1.447,0,0,0,2.5-.189V2.118a1.467,1.467,0,0,0-2.5-.238L8.161,8.787h-5c-1.6,0-1.875.288-1.875,1.853V16.9c0,1.526.313,1.876,1.875,1.876Z" transform="translate(-1.286 -1.287)" fill="#fff" />
                                </svg>

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
    } else if (currentSong && !ReactPlayer.canPlay("https://youtu.be/" + currentSong)) {
        return <Notice title={'Player Error'} text={"Can't play this song..."} />;
    }
};

export default Player;
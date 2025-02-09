import React, { useEffect, useState } from "react";
import SongItem from "./SongItem";
import getTVEpisodeData from "../../Services/API/getTVEpisodeData";
import '../../content/styles/songs.scss';

const SongList = ({ playItem, currentSong, songs, isPlaying }) => {
    const [episodeNames, setEpisodeNames] = useState({});

    useEffect(() => {
        const fetchEpisodeNames = async () => {
            const names = {};
            for (const song of songs) {
                const { season, episode, api_tmdb_id } = song;
                if (!names[season]) {
                    names[season] = {};
                }
                if (!names[season][episode]) {
                    const episodeData = await getTVEpisodeData(api_tmdb_id, season, episode);
                    names[season][episode] = episodeData.name;
                }
            }
            setEpisodeNames(names);
        };

        fetchEpisodeNames();
    }, [songs]);

    if (!songs.length) {
        return <div className="error">No songs available.</div>;
    }

    // Group songs by season and episode
    const groupedSongs = songs.reduce((acc, song) => {
        const { season, episode } = song;
        if (!acc[season]) {
            acc[season] = {};
        }
        if (!acc[season][episode]) {
            acc[season][episode] = [];
        }
        acc[season][episode].push(song);
        return acc;
    }, {});

    return (
        <section className="song-list">
            <div className="list-top">
                <h2 className="song-list-title">Playlist</h2>
                <div className="list-counter">
                    <i className="fas fa-list"></i>
                    <b className="list-count">{songs.length}</b>
                </div>
            </div>
            {Object.keys(groupedSongs).map(season => (
                <div key={season} className="season-block">
                    <h3 className="season-title">Season {season}</h3>
                    {Object.keys(groupedSongs[season]).map(episode => (
                        <div key={episode} className="episode-block">
                            <h4 className="episode-title">
                                {episodeNames[season] && episodeNames[season][episode]}
                            </h4>
                            {groupedSongs[season][episode].map(item => (
                                <SongItem
                                    playItem={playItem}
                                    currentSong={currentSong}
                                    id={item.youtube_id}
                                    key={item.id}
                                    songAuthor={item.author}
                                    songTitle={item.title}
                                    isPlaying={isPlaying}
                                    youtubeLink={item.youtube_link}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </section>
    );
};

export default SongList;
import React, { useEffect, useState } from "react";
import SongItem from "./SongItem";
import getTVEpisodeData from "../../Services/API/getTVEpisodeData";
import '../../content/styles/songs.scss';

const SongList = ({ playItem, currentSong, songs, isPlaying }) => {
    const [episodeNames, setEpisodeNames] = useState({});
    const [episodeThumbnails, setEpisodeThumbnails] = useState({});
    const [collapsedEpisodes, setCollapsedEpisodes] = useState({});
    const [repetitiveSongs, setRepetitiveSongs] = useState({});
    const [selectedThumbnail, setSelectedThumbnail] = useState(null);

    useEffect(() => {
        const fetchEpisodeData = async () => {
            const names = {};
            const thumbnails = {};
            for (const song of songs) {
                const { season, episode, api_tmdb_id } = song;
                if (!names[season]) {
                    names[season] = {};
                    thumbnails[season] = {};
                }
                if (!names[season][episode]) {
                    const episodeData = await getTVEpisodeData(api_tmdb_id, season, episode);
                    names[season][episode] = episodeData.name;
                    thumbnails[season][episode] = episodeData.still_path ? `https://image.tmdb.org/t/p/w780${episodeData.still_path}` : null;
                }
            }
            setEpisodeNames(names);
            setEpisodeThumbnails(thumbnails);
        };

        fetchEpisodeData();
    }, [songs]);

    useEffect(() => {
        // Initialize collapsedEpisodes state with all episodes collapsed by default
        const initialCollapsedState = songs.reduce((acc, song) => {
            const { season, episode } = song;
            if (!acc[season]) {
                acc[season] = {};
            }
            acc[season][episode] = true;
            return acc;
        }, {});
        setCollapsedEpisodes(initialCollapsedState);
    }, [songs]);

    useEffect(() => {
        // Identify repetitive songs
        const repetitions = songs.reduce((acc, song) => {
            const { youtube_id, season, episode } = song;
            if (!acc[youtube_id]) {
                acc[youtube_id] = [];
            }
            acc[youtube_id].push({ season, episode });
            return acc;
        }, {});

        // Filter out songs that are not repetitive
        const repetitiveSongs = Object.keys(repetitions).reduce((acc, youtube_id) => {
            if (repetitions[youtube_id].length > 1) {
                acc[youtube_id] = repetitions[youtube_id];
            }
            return acc;
        }, {});

        setRepetitiveSongs(repetitiveSongs);
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

    const toggleCollapse = (season, episode) => {
        setCollapsedEpisodes(prevState => ({
            ...prevState,
            [season]: {
                ...prevState[season],
                [episode]: !prevState[season]?.[episode]
            }
        }));
    };

    const handleThumbnailClick = (event, thumbnail) => {
        event.stopPropagation();
        setSelectedThumbnail(thumbnail);
    };

    const closeModal = () => {
        setSelectedThumbnail(null);
    };

    return (
        <section className="song-list">
            <div className="list-top">
                <h2 className="song-list-title">
                    <i className="fas fa-music"></i> Playlist
                </h2>
                <div className="list-counter">
                    <i className="fas fa-list"></i>
                    <b className="list-count">{songs.length}</b>
                </div>
            </div>
            {Object.keys(groupedSongs).map(season => (
                <div key={season} className="season-block">
                    <h3 className="season-title">
                        <i className="fa-solid fa-film"></i> Season {season}
                    </h3>
                    {Object.keys(groupedSongs[season]).map(episode => (
                        <div key={episode} className="episode-block">
                            <h4 className="episode-title" onClick={() => toggleCollapse(season, episode)}>
                                <i className={`fas ${collapsedEpisodes[season]?.[episode] ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
                                {episodeThumbnails[season] && episodeThumbnails[season][episode] && (
                                    <img
                                        src={episodeThumbnails[season][episode]}
                                        alt={`Episode ${episode} thumbnail`}
                                        className="episode-thumbnail"
                                        onClick={(event) => handleThumbnailClick(event, episodeThumbnails[season][episode])}
                                    />
                                )}
                                Episode {episode} - {episodeNames[season] && episodeNames[season][episode]}
                            </h4>
                            {!collapsedEpisodes[season]?.[episode] && (
                                groupedSongs[season][episode]
                                    .sort((a, b) => {
                                        if (a.is_opening) return -1;
                                        if (b.is_opening) return 1;
                                        if (a.is_ending) return 1;
                                        if (b.is_ending) return -1;
                                        return 0;
                                    })
                                    .map(item => (
                                        <SongItem
                                            playItem={playItem}
                                            currentSong={currentSong}
                                            id={item.youtube_id}
                                            key={item.id}
                                            songAuthor={item.author}
                                            songTitle={item.title}
                                            isPlaying={isPlaying}
                                            youtubeLink={item.youtube_link}
                                            isOpening={item.is_opening}
                                            isEnding={item.is_ending}
                                            repetitions={repetitiveSongs[item.youtube_id]}
                                        />
                                    ))
                            )}
                        </div>
                    ))}
                </div>
            ))}
            {selectedThumbnail && (
                <div className="modal" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close" onClick={closeModal}>&times;</span>
                        <img src={selectedThumbnail} alt="Episode thumbnail" className="modal-thumbnail" />
                    </div>
                </div>
            )}
        </section>
    );
};

export default SongList;
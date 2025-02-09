import React, { useEffect, useState } from 'react';
import FilmCardItem from './FilmCardItem';
import getFilmSongs from '../../Services/API/getFilmSongs';
import '../../content/styles/filmList.scss';

const FilmList = ({ films, onSelectFilm }) => {
    const [songCounts, setSongCounts] = useState({});

    useEffect(() => {
        const fetchSongCounts = async () => {
            const counts = {};
            for (const film of films) {
                const film_id = film.api_tmdb_id ? film.api_tmdb_id : film.api_shiki_id;

                const songs = await getFilmSongs(film_id);
                counts[film.id] = songs.length;
            }
            setSongCounts(counts);
        };

        fetchSongCounts();
    }, [films]);

    // Split films into blocks
    const firstBlock = films.slice(0, 1);
    const secondBlock = films.slice(1, 3);
    const thirdBlock = films.slice(3, 6);

    return (
        <div className="film-list">
            <div className="film-block">
                <h2 className="film-block-title">Featured Film</h2>
                <div className="film-row single">
                    {firstBlock.map(film => (
                        <FilmCardItem
                            key={film.id}
                            film={film}
                            onSelectFilm={onSelectFilm}
                            size="big"
                            songCount={songCounts[film.id] || 0}
                        />
                    ))}
                </div>
            </div>
            <div className="film-block">
                <h2 className="film-block-title">Popular Films</h2>
                <div className="film-row double">
                    {secondBlock.map(film => (
                        <FilmCardItem
                            key={film.id}
                            film={film}
                            onSelectFilm={onSelectFilm}
                            size="normal"
                            songCount={songCounts[film.id] || 0}
                        />
                    ))}
                </div>
            </div>
            <div className="film-block">
                <h2 className="film-block-title">More Films</h2>
                <div className="film-row triple">
                    {thirdBlock.map(film => (
                        <FilmCardItem
                            key={film.id}
                            film={film}
                            onSelectFilm={onSelectFilm}
                            size="small"
                            songCount={songCounts[film.id] || 0}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilmList;
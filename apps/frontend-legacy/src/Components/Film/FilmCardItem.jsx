import React, { useState, useEffect } from "react";
import '../../content/styles/filmCardItem.scss';
import getFilmInfo from "../../Services/API/getFilmInfo";

const FilmCardItem = ({ film, onSelectFilm, size, songCount }) => {
    const [filmInfo, setFilmInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFilmInfo = async () => {
            try {
                const info = await getFilmInfo(film.api_tmdb_id, film.tv_series ? 'tv' : 'movie');
                setFilmInfo(info);
            } catch (error) {
                console.error('Error fetching film info:', error);
                setError('Failed to fetch film information.');
            }
        };

        fetchFilmInfo();
    }, [film.api_tmdb_id, film.tv_series]);

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!filmInfo) {
        return <div className="loading">Loading...</div>;
    }

    // Get film year
    const releaseDate = new Date(filmInfo.release_date || filmInfo.first_air_date);
    const releaseYear = releaseDate.getFullYear();

    // Determine image size based on card size
    let imageSize;
    switch (size) {
        case 'small':
            imageSize = 'w500';
            break;
        case 'normal':
            imageSize = 'w780';
            break;
        case 'big':
            imageSize = 'w1280';
            break;
        default:
            imageSize = 'w500';
    }

    return (
        <figure className={`film-item ${size}`} onClick={() => onSelectFilm(film.api_tmdb_id, film.tv_series ? 'tv' : 'movie')}>
            <div className="song-count">{songCount} songs</div>
            <figcaption>{filmInfo.title || filmInfo.name} ({releaseYear})</figcaption>
            <picture>
                <img loading="lazy" src={`https://image.tmdb.org/t/p/${imageSize}/${filmInfo.backdrop_path}`} alt={filmInfo.title || filmInfo.name} />
            </picture>
        </figure>
    );
};

export default FilmCardItem;
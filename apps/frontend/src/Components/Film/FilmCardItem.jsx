import React from "react";
import '../../content/styles/filmCardItem.scss';

const FilmCardItem = ({ film, onSelectFilm, size, songCount }) => {
    // Get film year
    const releaseDate = new Date(film.release_date);
    const releaseYear = releaseDate.getFullYear();

    return (
        <figure className={`film-item ${size}`} onClick={() => onSelectFilm(film.id)}>
            <div className="song-count">5 {songCount} songs</div>
            <figcaption>{film.title} ({releaseYear})</figcaption>
            <picture>
                <img src={`https://image.tmdb.org/t/p/w200/${film.poster_path}`} alt={film.title} />
            </picture>
        </figure>
    );
};

export default FilmCardItem;
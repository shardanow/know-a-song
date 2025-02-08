import React from "react";
import '../../content/styles/filmCardItem.scss';

const FilmCardItem = ({ film, onSelectFilm }) => {
    return (
        <figure className="film-item" onClick={() => onSelectFilm(film.id)}>
            <figcaption>{film.title}</figcaption>
            <picture>
                <img src={`https://image.tmdb.org/t/p/w200/${film.poster_path}`} alt={film.title} />
            </picture>
        </figure>
    );
};

export default FilmCardItem;
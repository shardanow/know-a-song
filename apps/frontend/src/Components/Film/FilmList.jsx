import React from 'react';
import FilmCardItem from './FilmCardItem';
import '../../content/styles/filmList.scss';

const FilmList = ({ films, onSelectFilm }) => {
    return (
        <div className="film-list">
            {films.map(film => (
                <FilmCardItem key={film.id} film={film} onSelectFilm={onSelectFilm} />
            ))}
        </div>
    );
};

export default FilmList;
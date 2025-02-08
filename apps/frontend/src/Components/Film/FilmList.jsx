import React from 'react';
import FilmCardItem from './FilmCardItem';
import '../../content/styles/filmList.scss';

const FilmList = ({ films, onSelectFilm }) => {
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
                        <FilmCardItem key={film.id} film={film} onSelectFilm={onSelectFilm} size="big" songCount="5" />
                    ))}
                </div>
            </div>
            <div className="film-block">
                <h2 className="film-block-title">Popular Films</h2>
                <div className="film-row double">
                    {secondBlock.map(film => (
                        <FilmCardItem key={film.id} film={film} onSelectFilm={onSelectFilm} size="normal" songCount="3" />
                    ))}
                </div>
            </div>
            <div className="film-block">
                <h2 className="film-block-title">More Films</h2>
                <div className="film-row triple">
                    {thirdBlock.map(film => (
                        <FilmCardItem key={film.id} film={film} onSelectFilm={onSelectFilm} size="small" songCount="7" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilmList;
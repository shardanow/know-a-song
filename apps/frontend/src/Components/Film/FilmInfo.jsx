import React from "react";
import '../../content/styles/film.scss';

const FilmInfo = ({ filmInfo }) => {
    const { isLoaded, filmTitle, filmYear, filmBackground } = filmInfo;

    if (isLoaded) {
        return (
            <section className="film-info">
                <figure className="film-image">
                    <figcaption className="film-title">
                        <b className="film-title-text">{filmTitle}</b> <i className="film-title-year">({filmYear})</i>
                    </figcaption>
                    <picture>
                        <img src={filmBackground} alt={`${filmTitle} - ${filmYear}`} />
                    </picture>
                </figure>
            </section>
        );
    }

    return null;
};

export default FilmInfo;
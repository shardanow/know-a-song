import React from "react";
import '../../content/styles/film.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

const FilmInfo = ({ filmInfo }) => {
    const { isLoaded, filmTitle, filmYear, filmBackground, filmDBLink } = filmInfo;

    if (isLoaded) {
        return (
            <section className="film-info">
                <figure className="film-image">
                    <figcaption className="film-title">
                        <b className="film-title-text">{filmTitle}</b> <i className="film-title-year">({filmYear})</i>
                    </figcaption>
                    <picture>
                        <img loading="lazy" src={filmBackground} alt={`${filmTitle} - ${filmYear}`} />
                    </picture>
                    <a href={filmDBLink} className="film-db-link" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faLink} />
                    </a>
                </figure>
            </section>
        );
    }

    return null;
};

export default FilmInfo;
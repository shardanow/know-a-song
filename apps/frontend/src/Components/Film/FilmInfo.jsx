import React from "react";

class FilmInfo extends React.Component{

    render() {
        const { isLoaded, filmTitle, filmYear,filmBackground } = this.props.filmInfo;

        if(isLoaded)
            return (
                <section className="film-info">
                    <figure className="film-image">
                        <figcaption className="film-title"><b className="film-title-text">{filmTitle}</b> <i className="film-title-year">({filmYear})</i></figcaption>
                        <picture>
                            <img src={filmBackground} alt={filmTitle+" - "+filmYear}/>
                        </picture>
                    </figure>
                </section>
            );

    }

}

export default FilmInfo;
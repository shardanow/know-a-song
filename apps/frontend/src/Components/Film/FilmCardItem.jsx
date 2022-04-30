import React from "react";

class FilmCardItem extends React.Component{

    render() {
        return (
            <figure className="film-item">
                <figcaption>Some Film Title</figcaption>
                <picture>
                    <img src="https://picsum.photos/seed/picsum/200/300" alt=""/>
                </picture>
            </figure>
        );
    }

}

export default FilmCardItem;
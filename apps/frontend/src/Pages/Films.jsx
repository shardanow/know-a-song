import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LeftBar from "../Components/Containers/LeftBar";
import RightBar from "../Components/Containers/RightBar";
import ContentContainer from "../Components/Containers/ContentContainer";
import FilmItem from "../Components/Film/FilmItem";
import FilmList from "../Components/Film/FilmList";
import getRandomFilms from "../Services/API/getRandomFilms"; // Assume this is a function to fetch random films

const Film = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [films, setFilms] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRandomFilms = async () => {
            try {
                const filmsData = await getRandomFilms();
                setFilms(filmsData);
            } catch (e) {
                console.error(e);
                setError('Failed to fetch films.');
            }
        };

        if (!id) {
            fetchRandomFilms();
        }
    }, [id]);

    const handleSelectFilm = (filmID) => {
        navigate(`/film/${filmID}`);
    };

    let ContainerComponent;
    if (id) {
        // Render FilmItem component with the correct props
        ContainerComponent = () => <FilmItem filmID={id} />;
    } else {
        // Render FilmList component with the correct props
        ContainerComponent = () => <FilmList onSelectFilm={handleSelectFilm} films={films} />;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <section className="main-container">
            <LeftBar />
            <ContentContainer ContainerComponent={ContainerComponent} />
            <RightBar />
        </section>
    );
};

export default Film;
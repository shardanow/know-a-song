const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const TMDB_TOKEN = process.env.REACT_APP_TMDB_TOKEN;

async function request(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

const apiClient = {
    getFilms() {
        return request(`${API_URL}/films`);
    },

    getFilmSongs(filmId) {
        return request(`${API_URL}/songs/${filmId}`);
    },

    getFilmInfo(id, type = 'movie') {
        const url = `https://api.themoviedb.org/3/${type}/${id}`;
        return request(url, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${TMDB_TOKEN}`,
            },
        });
    },

    getRandomFilms(type = 'movie', limit = 10) {
        const url = `https://api.themoviedb.org/3/discover/${type}?sort_by=popularity.desc&page=1`;
        return request(url, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${TMDB_TOKEN}`,
            },
        }).then(data => data.results.slice(0, limit));
    },

    getTVEpisodeData(seriesId, season, episode) {
        const url = `https://api.themoviedb.org/3/tv/${seriesId}/season/${season}/episode/${episode}`;
        return request(url, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${TMDB_TOKEN}`,
            },
        });
    },

    getTVSeasonData(seriesId, season) {
        const url = `https://api.themoviedb.org/3/tv/${seriesId}/season/${season}`;
        return request(url, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${TMDB_TOKEN}`,
            },
        });
    },
};

export default apiClient;

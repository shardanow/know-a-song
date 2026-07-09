import apiClient from './apiClient';

async function getFilmSongs(filmId) {
    return apiClient.getFilmSongs(filmId);
}

export default getFilmSongs;

import apiClient from './apiClient';

async function getRandomFilms(type = 'movie', limit = 10) {
    return apiClient.getRandomFilms(type, limit);
}

export default getRandomFilms;

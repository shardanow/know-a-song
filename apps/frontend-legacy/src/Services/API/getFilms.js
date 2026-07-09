import apiClient from './apiClient';

async function getFilms(limit = 10) {
    const data = await apiClient.getFilms();
    return data.slice(0, limit);
}

export default getFilms;

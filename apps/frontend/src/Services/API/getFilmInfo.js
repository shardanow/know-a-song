import apiClient from './apiClient';

async function getFilmInfo(id, type = 'movie') {
    return apiClient.getFilmInfo(id, type);
}

export default getFilmInfo;

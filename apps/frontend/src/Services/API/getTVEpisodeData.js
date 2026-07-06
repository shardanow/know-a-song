import apiClient from './apiClient';

async function getTVEpisodeData(seriesId, season, episode) {
    return apiClient.getTVEpisodeData(seriesId, season, episode);
}

export default getTVEpisodeData;

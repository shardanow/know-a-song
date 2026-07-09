import apiClient from './apiClient';

async function getTVSeasonData(seriesId, season) {
    return apiClient.getTVSeasonData(seriesId, season);
}

export default getTVSeasonData;

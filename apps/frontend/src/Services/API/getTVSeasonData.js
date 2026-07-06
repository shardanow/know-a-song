import fetchTMDBJSONData from "./getTMDBDataMethods";

/**
 * Fetches Season data for a given TV show ID and season number.
 * @param {number} tvID - The ID of the TV show.
 * @param {number} seasonNumber - The season number.
 * @returns {Promise<Object>} - A promise that resolves to the season data.
 */
async function getTVSeasonData(tvID, seasonNumber) {
    const url = `https://api.themoviedb.org/3/tv/${tvID}/season/${seasonNumber}`;
    
    try {
        const data = await fetchTMDBJSONData(url);
        console.log(data); // Log the data for debugging

        return data;
    } catch (error) {
        console.error('Error fetching TV season data:', error);
        throw error;
    }
}

export default getTVSeasonData;
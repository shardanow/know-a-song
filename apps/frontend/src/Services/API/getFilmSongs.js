import fetchJSONData from "./getDataMethods";

async function getFilmSongs(filmId) {
    const url = `http://localhost:3000/api/songs/${filmId}`;

    try {
        const data = await fetchJSONData(url);
        console.log(data); // Log the results for debugging
        return data;
    } catch (error) {
        console.error(`Failed to fetch songs for film ${filmId}:`, error);
        throw error;
    }
}

export default getFilmSongs;
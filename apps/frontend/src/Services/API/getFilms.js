import fetchJSONData from "./getBasicDataMethods";

async function getRandomFilms(limit = 10) {
    const url = `http://localhost:3000/api/films`;

    try {
        const data = await fetchJSONData(url);
        console.log(data); // Log the results for debugging
        return data.slice(0, limit);
    } catch (error) {
        console.error('Failed to fetch random films:', error);
        throw error;
    }
}

export default getRandomFilms;
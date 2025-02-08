import fetchJSONData from "./getDataMethods";

async function getRandomFilms(type = 'movie') {
    const apiKey = 'e6aa910d4f96cc9932b818e8cc3b34ba';
    const url = `https://api.themoviedb.org/3/discover/${type}?api_key=${apiKey}&sort_by=popularity.desc`;

    try {
        const data = await fetchJSONData(url);
        console.log(data.results); // Log the results for debugging
        return data.results;
    } catch (error) {
        console.error(`Failed to fetch random ${type}s:`, error);
        throw error;
    }
}

export default getRandomFilms;
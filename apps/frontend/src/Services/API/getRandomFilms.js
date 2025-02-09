import fetchTMDBJSONData from "./getTMDBDataMethods";

async function getRandomFilms(type = 'movie', limit = 10) {
    const url = `https://api.themoviedb.org/3/discover/${type}?sort_by=popularity.desc&page=1`;

    try {
        const data = await fetchTMDBJSONData(url);
        console.log(data.results); // Log the results for debugging
        return data.results.slice(0, limit);
    } catch (error) {
        console.error(`Failed to fetch random ${type}s:`, error);
        throw error;
    }
}

export default getRandomFilms;
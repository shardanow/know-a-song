import fetchJSONData from "./getDataMethods";

async function getFilmInfo(id, type = 'movie') {
    const apiKey = 'e6aa910d4f96cc9932b818e8cc3b34ba';
    const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}`;

    try {
        const data = await fetchJSONData(url);
        console.log(data);
        return data;
    } catch (error) {
        console.error(`Failed to fetch ${type} info:`, error);
        throw error;
    }
}

export default getFilmInfo;
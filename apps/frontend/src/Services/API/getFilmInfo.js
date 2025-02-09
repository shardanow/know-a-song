import fetchTMDBJSONData from "./getTMDBDataMethods";

async function getFilmInfo(id, type = 'movie') {
    const url = `https://api.themoviedb.org/3/${type}/${id}`;

    try {
        const data = await fetchTMDBJSONData(url);
        console.log(data);
        return data;
    } catch (error) {
        console.error(`Failed to fetch ${type} info:`, error);
        throw error;
    }
}

export default getFilmInfo;
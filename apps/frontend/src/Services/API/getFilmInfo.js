import fetchJSONData from "./getDataMethods";

async function getFilmInfo(id){
    return await fetchJSONData('https://api.themoviedb.org/3/tv/'+id+'?api_key=e6aa910d4f96cc9932b818e8cc3b34ba').then(data => {
        console.log(data);

        return data;
    });
}

export default getFilmInfo;
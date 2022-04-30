export default async function fetchJSONData(url){
    let jsonData = fetch(url).then(response => {
        return response.json()
    });

    return await jsonData;
}
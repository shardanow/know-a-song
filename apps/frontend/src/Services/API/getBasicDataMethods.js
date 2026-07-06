export default async function fetchJSONData(url){
    let jsonData = fetch(url).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json()
    });

    return await jsonData;
}
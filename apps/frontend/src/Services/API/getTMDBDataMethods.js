export default async function fetchTMDBJSONData(url){
    const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlNmFhOTEwZDRmOTZjYzk5MzJiODE4ZThjYzNiMzRiYSIsIm5iZiI6MTU0MjIyMDMzMy44MTIsInN1YiI6IjViZWM2YTJkOTI1MTQxM2NmMDAwMDE1YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.XtP1oIip0CI33FQUDJVt7HN5ahID6CSxDhufmoTmeic';

    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + API_KEY
        }
      };

    let jsonData = fetch(url, options).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json()
    });

    return await jsonData;
}
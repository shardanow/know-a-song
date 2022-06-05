const db = require('../db');

class SongController{
    async createSong(request, response){
        const {film_id, owner_id, author, title, season} = request.body;
        const newSong = await db.query(
            'INSERT INTO Songs(film_id, owner_id, author, title, season) VALUES ($1, $2, $3, $4, $5) RETURNING *'
            , [film_id, owner_id, author, title, season]);

        console.info(newSong);
        response.json(newSong);
    }

    async createSongSource(request, response){
        const {song_id, owner_id, youtube_id, youtube_link, spotify_id, spotify_link, apple_m_id, apple_m_link} = request.body;
        const newSongSource = await db.query(
            'INSERT INTO SongSources(song_id, owner_id, youtube_id, youtube_link, spotify_id, spotify_link, apple_m_id, apple_m_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *'
            , [song_id, owner_id, youtube_id, youtube_link, spotify_id, spotify_link, apple_m_id, apple_m_link]);

        console.info(newSongSource);
        response.json(newSongSource);
    }

    async getSongs(request, response){
        const getSongs = await db.query(
            'SELECT ' +
            'Songs.id, ' +
            'Songs.film_id, ' +
            'Songs.owner_id AS song_owner_id, ' +
            'Songs.title, Songs.author, ' +
            'Songs.season, ' +
            'SongSources.owner_id AS source_owner_id, ' +
            'SongSources.apple_m_id, ' +
            'SongSources.apple_m_link, ' +
            'SongSources.spotify_id, ' +
            'SongSources.spotify_link, ' +
            'SongSources.youtube_id, ' +
            'SongSources.youtube_link ' +
            'FROM Songs ' +
            'JOIN SongSources ON Songs.id = SongSources.song_id');

        console.info(getSongs);
        response.json(getSongs);
    }

    async getSongByID(request, response){
        const {id} = request.params;
        const getSong = await db.query(
            'SELECT ' +
            'Songs.id, ' +
            'Songs.film_id, ' +
            'Songs.owner_id AS song_owner_id, ' +
            'Songs.title, Songs.author, ' +
            'Songs.season, ' +
            'SongSources.owner_id AS source_owner_id, ' +
            'SongSources.apple_m_id, ' +
            'SongSources.apple_m_link, ' +
            'SongSources.spotify_id, ' +
            'SongSources.spotify_link, ' +
            'SongSources.youtube_id, ' +
            'SongSources.youtube_link ' +
            'FROM Songs ' +
            'JOIN SongSources ON Songs.id = SongSources.song_id ' +
            'WHERE Songs.id = $1'
            , [id]);

        console.info(getSong);
        response.json(getSong);
    }

    async updateSong(request, response){
        const {film_id, owner_id, author, title, season} = request.body;
        const {id} = request.params;
        const updateSong = await db.query(
            'UPDATE Songs set film_id = $2, owner_id = $3, author = $4, title = $5, season = $6 WHERE id = $1 RETURNING *'
            , [id, film_id, owner_id, author, title, season]);

        console.info(updateSong);
        response.json(updateSong);
    }

    async updateSongSource(request, response){
        const {song_id, owner_id, youtube_id, youtube_link, spotify_id, spotify_link, apple_m_id, apple_m_link} = request.body;
        const {id} = request.params;

        const updateSongSource = await db.query(
            'UPDATE SongSources set song_id = $2, owner_id = $3, youtube_id = $4, youtube_link = $5, spotify_id = $6, spotify_link = $7, apple_m_id = $8, apple_m_link = $9 WHERE song_id = $1 RETURNING *'
            , [id, song_id, owner_id, youtube_id, youtube_link, spotify_id, spotify_link, apple_m_id, apple_m_link]);

        console.info(updateSongSource);
        response.json(updateSongSource);
    }

    async deleteSong(request, response){
        const {id} = request.params;
        const deleteSong = await db.query(
            'DELETE FROM Songs WHERE id = $1 RETURNING *'
            , [id]);
        const deleteSongSource = await db.query(
            'DELETE FROM SongSources WHERE song_id = $1 RETURNING *'
            , [id]);

        deleteSong.concat(deleteSongSource);

        console.info(deleteSong);
        response.json(deleteSong);
    }

    async deleteSongSource(request, response){
        const {id} = request.params;
        const deleteSongSource = await db.query(
            'DELETE FROM SongSources WHERE song_id = $1 RETURNING *'
            , [id]);

        console.info(deleteSongSource);
        response.json(deleteSongSource);
    }
}

module.exports = new SongController();
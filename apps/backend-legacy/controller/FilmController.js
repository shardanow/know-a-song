const db = require('../db');

class FilmController{
    async createFilm(request, response){
        const {slug, tmdb_id, shiki_id, is_tv_series} = request.body;
        const newFilm = await db.query(
            'INSERT INTO Films(slug, api_tmdb_id, api_shiki_id, tv_series) VALUES ($1, $2, $3, $4) RETURNING *'
            , [slug, tmdb_id, shiki_id, is_tv_series]);

        console.info(newFilm);
        response.json(newFilm);
    }

    async getFilms(request, response){
        const getFilms = await db.query(
            'SELECT * FROM Films');

        console.info(getFilms);
        response.json(getFilms);
    }

    async getFilmByID(request, response){
        const {id} = request.params;
        const getFilm = await db.query(
            'SELECT * FROM Films WHERE id = $1'
            , [id]);

        console.info(getFilm);
        response.json(getFilm);
    }

    async getFilmBySlug(request, response){
        const {slug} = request.params;
        const getFilm = await db.query(
            'SELECT * FROM Films WHERE slug = $1'
            , [slug]);

        console.info(getFilm);
        response.json(getFilm);
    }

    async updateFilm(request, response){
        const {slug, tmdb_id, shiki_id, is_tv_series} = request.body;
        const {id} = request.params;
        const updateFilm = await db.query(
            'UPDATE Films set slug = $2, api_tmdb_id = $3, api_shiki_id = $4, tv_series = $5 WHERE id = $1 RETURNING *'
            , [id, slug, tmdb_id, shiki_id, is_tv_series]);

        console.info(updateFilm);
        response.json(updateFilm);
    }

    async deleteFilm(request, response){
        const {id} = request.params;
        const deleteFilm = await db.query(
            'DELETE FROM Films WHERE id = $1 RETURNING *'
            , [id]);

        console.info(deleteFilm);
        response.json(deleteFilm);
    }
}

module.exports = new FilmController();
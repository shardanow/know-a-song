const Router = require('express');
const router = new Router();
const filmController = require('../controller/FilmController');

router.post('/film', filmController.createFilm);
router.get('/film/:id/by_id', filmController.getFilmByID);
router.get('/film/:slug/by_slug', filmController.getFilmBySlug);
router.get('/films', filmController.getFilms);
router.put('/film/:id', filmController.updateFilm);
router.delete('/film/:id', filmController.deleteFilm);

module.exports = router;
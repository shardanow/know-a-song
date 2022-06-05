const Router = require('express');
const router = new Router();
const songController = require('../controller/SongController');

router.post('/song', songController.createSong);
router.post('/song_source/:id', songController.createSongSource);
router.get('/song/:id', songController.getSongByID);
router.get('/songs', songController.getSongs);
router.put('/song/:id', songController.updateSong);
router.put('/song_source/:id', songController.updateSongSource);
router.delete('/song/:id', songController.deleteSong);
router.delete('/song_source/:id', songController.deleteSongSource);

module.exports = router;
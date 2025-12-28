const express = require('express');
const router = express.Router();
const {
    getSongs,
    getRecentlyPlayed,
    getRecommended,
    searchSongs,
    playSong,
    orderSong,
} = require('../controllers/songController');

router.route('/').get(getSongs);
router.route('/recent').get(getRecentlyPlayed);
router.route('/recommended').get(getRecommended);
router.route('/search').get(searchSongs);
router.route('/:id/play').post(playSong);
router.route('/order').post(orderSong);

module.exports = router;

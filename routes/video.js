const { Router } = require('express');
const { body } = require('express-validator');
const Video = require('../models/video');
const videoController = require('../controller/video');
const isAuth = require('../middleware/isAuth');
const router = Router();

router.post('/', isAuth, videoController.postVideo); //upload a video
router.get('/all', isAuth, videoController.getVideos); //load all videos
router.get('/search', isAuth, videoController.getSearchVideos); //load all videos
router.get('/:videoId', isAuth, videoController.getVideo); //get a single video
router.post(
	'/:videoId/comment',
	[body('comment').trim().notEmpty().withMessage("Comment can't be empty.")],
	isAuth,
	videoController.postComment
);

module.exports = router;

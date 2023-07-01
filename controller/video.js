const { validationResult } = require('express-validator');
const User = require('../models/user');
const Video = require('../models/video');
const getVideoDuration = require('../util/getVideoDuration');

exports.getVideos = (req, res, next) => {
	const page = req.query.page || 1;
	const perPage = 21;
	let totalVideos;
	Video.find()
		.countDocuments()
		.then((count) => {
			totalVideos = count;
			return Video.find()
				.skip((page - 1) * perPage)
				.limit(perPage)
				.select('-url -comments -description -updatedAt -__v')
				.populate('user', 'name imageUrl');
			// .populate('comments.userId', 'name');
		})
		.then((videos) => {
			res.status(200).json({
				message: 'Fetched Videos successful',
				videos: videos,
				total: Math.ceil(totalVideos / perPage),
			});
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};

exports.getVideo = (req, res, next) => {
	const videoId = req.params.videoId;
	Video.findById(videoId)
		.populate('user', 'name imageUrl')
		.populate('comments.userId', 'name')
		.select('-__v -updatedAt -comments._id')
		.then((video) => {
			if (!video) {
				const error = new Error('Invalid Video Id');
				error.statusCode = 404;
				throw error;
			}
			res.status(200).json({
				message: 'Video fetched',
				data: video,
			});
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};

exports.postVideo = (req, res, next) => {
	if (!req.files.video[0]) {
		const error = new Error('No Video provided');
		error.statusCode = 422;
		throw error;
	}
	if (!req.files.thumbnail[0]) {
		const error = new Error('No thumbnail provided');
		error.statusCode = 422;
		throw error;
	}
	const title = req.body.title;
	const description = req.body.description || '';
	const videoPath = req.files.video[0].path;
	const thumbnailPath = req.files.thumbnail[0].path;
	const video = new Video({
		title: title,
		description: description,
		user: req.userId,
		url: videoPath,
		thumbnail: thumbnailPath,
	});
	getVideoDuration(req, videoPath)
		.then((duration) => {
			console.log(duration);
			video.duration = duration;
			return video.save();
		})
		.then((result) => {
			return User.findById(req.userId);
		})
		.then((user) => {
			console.log(user);
			user.videos.push(video);
			return user.save();
		})
		.then((result) => {
			res.status(200).json({ message: 'Video Created', video: video });
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};
exports.postComment = (req, res, next) => {
	const errors = validationResult(req);
	const videoId = req.params.videoId;
	if (!errors.isEmpty()) {
		const error = new Error('Comment Failed');
		error.statusCode = 422;
		throw error;
	}
	const commentStr = req.body.comment;
	Video.findById(videoId)
		.then((video) => {
			if (!video) {
				const error = new Error('Invalid Video Id');
				error.statusCode = 404;
				throw error;
			}
			console.log(req.userId);
			video.comments.push({ userId: req.userId, comment: commentStr });
			return video.save();
		})
		.then((result) => {
			res.status(200).json({ message: 'Comment added' });
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};

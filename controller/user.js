const { validationResult } = require('express-validator');
const User = require('../models/user');
// const Video = require('../models/video');
const bcrypt = require('bcryptjs');
const PER_PAGE = 21;

exports.getMyVideos = (req, res, next) => {
	const page = req.query.page || 1;
	let totalVideos;
	User.findById(req.userId)
		.select('videos')
		.skip((page - 1) * PER_PAGE)
		.limit(PER_PAGE)
		.populate({
			path: 'videos',
			select: '-url -comments',
			populate: { path: 'user', select: 'name imageUrl' },
		})
		.then((result) => {
			res.status(200).json({
				message: 'Fetched my videos',
				data: result,
				total: totalVideos,
			});
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};

exports.getUser = (req, res, next) => {
	const userId = req.params.userId;
	User.findById(userId)
		.select('-password -videos')
		.then((user) => {
			if (!user) {
				const error = new Error('No user Found');
				error.statusCode = 400;
				throw error;
			}
			res.status(200).json({ message: 'User found', data: user });
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};
exports.getUserVideos = (req, res, next) => {
	const page = req.query.page || 1;
	let totalVideos;
	User.findById(req.userId)
		.select('videos')
		.skip((PER_PAGE - 1) * page)
		.limit(PER_PAGE)
		.populate({
			path: 'videos',
			select: '-url -comments',
			populate: { path: 'user', select: 'name imageUrl' },
		})
		.then((result) => {
			res.status(200).json({
				message: 'Fetched my videos',
				data: result,
				total: totalVideos,
			});
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};
exports.getMyProfile = (req, res, next) => {
	User.findById(req.userId)
		.select('-password -videos')
		.then((user) => {
			res.status(200).json({ message: 'User found', data: user });
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};
exports.postUser = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed');
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}
	const newUserImg = req.files.userImg[0].path;
	const { name, currentPassword, password } = req.body;
	let currUser;
	User.findById(req.userId)
		.then((user) => {
			currUser = user;
			user.name = name;
			//Check if image present and change the URL for it.
			if (newUserImg) {
				user.imageUrl = newUserImg;
			}
			// if password is changed
			if (currentPassword) {
				return bcrypt.compare(currentPassword, user.password);
			}
			return Promise.resolve(true);
		})
		.then((isTrue) => {
			if (!isTrue) {
				const error = new Error('Current password did not match');
				error.statusCode = 401;
				throw error;
			}
			if (currentPassword) {
				return bcrypt.hash(password, 12);
			}
			return Promise.resolve(false);
		})
		.then((hash) => {
			console.log(hash);
			if (hash !== false) {
				currUser.password = hash;
			}
			return currUser.save();
		})
		.then((result) => {
			res.status(200).json({ message: 'Profile Updated', data: result });
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};

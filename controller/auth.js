const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation Error');
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}
	const { email, name, password } = req.body;
	bcrypt
		.hash(password, 12)
		.then((hashPW) => {
			const user = new User({
				email: email,
				name: name,
				password: hashPW,
			});
			return user.save();
		})
		.then((result) => {
			res.status(200).json({
				message: 'Signup Successful',
				userId: result._id,
			});
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};
exports.login = (req, res, next) => {
	const { email, password } = req.body;
	let loadedUser;
	User.findOne({ email: email })
		.then((user) => {
			if (!user) {
				const error = new Error(
					'A user with this email does not exists.'
				);
				error.statusCode = 401;
				throw error;
			}
			loadedUser = user;
			return bcrypt.compare(password, user.password);
		})
		.then((isEqual) => {
			if (!isEqual) {
				const error = new Error('Invalid Password');
				error.statusCode = 401;
				throw error;
			}
			const token = jwt.sign(
				{
					email: loadedUser.email,
					userId: loadedUser._id.toString(),
				},
				process.env.JWT_SECRET,
				{ expiresIn: '1h' }
			);
			res.status(200).json({
				token: token,
				id: loadedUser._id.toString(),
				image: loadedUser.imageUrl,
				name: loadedUser.name,
				expiresIn: new Date(Date.now() + 3600000),
			});
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};

const { Router } = require('express');
const { body } = require('express-validator');
const User = require('../models/user');
const authController = require('../controller/auth');
const router = Router();

router.put(
	'/signup',
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a Valid Email')
			.normalizeEmail()
			.custom((value, { req }) => {
				return User.findOne({ email: value }).then((user) => {
					if (user) return Promise.reject('Email Already exists.');
				});
			}),
		body('name')
			.trim()
			.isAlpha('en-IN', { ignore: ' ' })
			.withMessage('Name can only contain Alphabets')
			.isLength({ min: 3 })
			.withMessage('Name should have minimum 3 length'),
		body('password')
			.trim()
			.isLength({ min: 8 })
			.withMessage('Password must be of atleast 8 length'),
		body('confirmPassword')
			.trim()
			.custom((value, { req }) => {
				if (req.body.password !== value) {
					throw new Error('Confirm Password does not match');
				}
				return true;
			}),
	],
	authController.signup
);
router.post('/login', [body('email').normalizeEmail()], authController.login);

module.exports = router;

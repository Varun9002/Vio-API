const { Router } = require('express');

const userController = require('../controller/user');
const isAuth = require('../middleware/isAuth');
const { body, oneOf } = require('express-validator');

const router = Router();

router.get('/myVideos', isAuth, userController.getMyVideos);
router.get('/myProfile', isAuth, userController.getMyProfile);
router.get('/:userId/videos', isAuth, userController.getUserVideos);
router.get('/:userId', isAuth, userController.getUser);
router.post(
	'/myProfile',
	[
		body('name')
			.trim()
			.isAlpha('en-IN', { ignore: ' ' })
			.withMessage('Name can only contain Alphabets')
			.isLength({ min: 3 })
			.withMessage('Name should have minimum 3 length'),
		oneOf([
			[
				body('currentPassword')
					.isEmpty()
					.withMessage(
						'Fill all the feilds for changing the password'
					),
				body('password')
					.isEmpty()
					.withMessage(
						'Fill all the feilds for changing the password'
					),
				body('confirmPassword')
					.isEmpty()
					.withMessage(
						'Fill all the feilds for changing the password'
					),
			],
			[
				body('password')
					.trim()
					.isLength({ min: 8 })
					.withMessage('Password must be atleast 8 characters.'),
				body('confirmPassword')
					.trim()
					.custom((value, { req }) => {
						if (req.body.password !== value) {
							throw new Error('Confirm Password does not match');
						}
						return true;
					}),
			],
		]),
	],
	isAuth,
	userController.postUser
);
// router.get('/:userId/videos', isAuth, userController.getMyVideos);

module.exports = router;

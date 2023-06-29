const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const uuid = require('uuid');
const path = require('path');

const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/video');
const userRoutes = require('./routes/user');
const fs = require('fs');
require('dotenv').config();
const app = express();

app.use(bodyParser.json());

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		if (file.fieldname === 'video')
			return cb(null, path.join('public', 'videos'));
		if (file.fieldname === 'thumbnail')
			return cb(null, path.join('public', 'thumbnail'));
		cb(null, path.join('public', 'userImg'));
	},
	filename: (req, file, cb) => {
		cb(null, uuid.v1() + '.' + path.extname(file.originalname));
	},
});
const fileFilter = (req, file, cb) => {
	if (
		(file.fieldname === 'video' && file.mimetype === 'video/mp4') ||
		(file.fieldname !== 'video' &&
			(file.mimetype === 'image/png' ||
				file.mimetype === 'image/jpg' ||
				file.mimetype === 'image/jpeg'))
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

app.use(
	multer({ storage: fileStorage, fileFilter: fileFilter }).fields([
		{ name: 'video', maxCount: 1 },
		{ name: 'thumbnail', maxCount: 1 },
		{ name: 'userImg', maxCount: 1 },
	])
);
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Methods',
		'OPTIONS, GET, POST, PUT, PATCH, DELETE'
	);
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization'
	);
	next();
});

app.use('/auth', authRoutes);
app.use('/video', videoRoutes);
app.use('/user', userRoutes);

app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;
	for (const file in req.files) {
		fs.unlink(req.files[file][0].path, (err) => {
			if (err) console.log(err);
		});
	}
	res.status(status).json({ message: message, data: data });
});

mongoose
	.connect(process.env.DB_CONN_URL)
	.then(() => {
		app.listen(process.env.PORT, (res) => {
			console.log(
				`⚡️[server]: Server is running at http://localhost:${process.env.PORT}`
			);
		});
	})
	.catch((err) => {
		console.log(err);
	});

const { Schema, default: mongoose } = require('mongoose');

const userSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	imageUrl: {
		type: String,
	},
	videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
	// follower: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('User', userSchema);

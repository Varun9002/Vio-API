const { Schema, default: mongoose } = require('mongoose');

const videoSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			default: '',
		},
		views: {
			type: Number,
			default: 0,
		},
		thumbnail: {
			type: String,
			required: true,
		},
		duration: {
			type: Number,
			default: 10,
		},
		url: {
			type: String,
			required: true,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		comments: [
			{
				userId: {
					type: Schema.Types.ObjectId,
					ref: 'User',
				},
				comment: {
					type: String,
					required: true,
				},
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Video', videoSchema);

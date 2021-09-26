const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			default: '',
			max: 500,
		},
		image: {
			type: String,
			default: ' ',
		},
		likes: {
			type: Array,
			default: [],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);

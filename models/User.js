const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			require: true,
			min: 3,
		},
		email: {
			type: String,
			require: true,
			min: 3,
			unique: true,
		},
		password: {
			type: String,
			require: true,
			min: 3,
		},
		profilePicture: {
			type: String,
			default: '',
		},
		coverPicture: {
			type: String,
			default: 'http://source.unsplash.com/350x150/?nature',
		},
		followers: {
			type: Array,
			default: [],
		},
		following: {
			type: Array,
			default: [],
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		description: {
			type: String,
			default: '',
			max: 50,
		},
		hometown: {
			type: String,
			default: '',
		},

		dob: {
			type: Date,
			default: '',
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);

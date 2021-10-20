const bcrypt = require('bcryptjs');

const router = require('express').Router();
const User = require('../models/User');

//get all users
router.get('/all', async (req, res) => {
	try {
		const allUsers = await User.find({});
		const data = allUsers.map((user) => {
			const { password, updatedAt, ...others } = user._doc;
			return others;
		});
		res.status(200).json(data);
	} catch (error) {
		res.status(500).send('some error occoured');
	}
});

//update user
router.put('/:id', async (req, res) => {
	if (req.body.userId === req.params.id || req.body.isAdmin) {
		console.log('Recieved request');
		if (req.body.password) {
			try {
				const salt = await bcrypt.genSalt(10);
				req.body.password = await bcrypt.hash(req.body.password, salt);
			} catch (error) {
				console.log(error);
				res.json(error);
			}
		}
		try {
			const user = await User.findByIdAndUpdate(req.body.userId, {
				$set: req.body,
			});
			res.send('Account updated sucessfully');
		} catch (error) {
			console.log(error);
			res.json(error);
		}
	} else {
		console.log('bad req');
		res.send('access denied');
	}
});
//delete user
router.delete('/:id', async (req, res) => {
	if (req.body.userId === req.params.id || req.body.isAdmin) {
		try {
			const user = await User.findByIdAndDelete(req.body.userId);
			res.send('Account deleted sucessfully');
		} catch (error) {
			console.log(error);
			res.json(error);
		}
	} else {
		res.send('You can only delete your account');
	}
});

//get a user
router.get('/:id', async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		const { password, updatedAt, ...others } = user._doc;
		res.json(others);
	} catch (error) {
		console.log(error);
		res.send('some error occured');
	}
});

//follow a user
router.put('/:id/follow', async (req, res) => {
	if (req.body.userId !== req.params.id) {
		try {
			const user = await User.findById(req.params.id);
			const currentUser = await User.findById(req.body.userId);

			if (user.followers.includes(req.body.userId)) {
				res.status(406).send('You already follow this user');
			} else {
				await user.updateOne({ $push: { followers: req.body.userId } });
				await currentUser.updateOne({ $push: { following: req.params.id } });
				res.status(200).send('User Followed sucessfully');
			}
		} catch (error) {
			console.log(error);
			res.status(500).send('some error occoured');
		}
	} else {
		res.status(406).send('You cannot follow yourself');
	}
});

//unfollow a user
router.put('/:id/unfollow', async (req, res) => {
	if (req.body.userId !== req.params.id) {
		try {
			const user = await User.findById(req.params.id);
			const currentUser = await User.findById(req.body.userId);
			if (!user.followers.includes(req.body.userId)) {
				res.status(406).send('You do not follow this user');
			} else {
				await user.updateOne({ $pull: { followers: req.body.userId } });
				await currentUser.updateOne({ $pull: { following: req.params.id } });
				res.status(200).send('User unfollowed sucessfully');
			}
		} catch (error) {
			console.log(error);
			res.status(500).send('some error occoured');
		}
	} else {
		res.send('You cannot unfollow yourself');
	}
});

module.exports = router;

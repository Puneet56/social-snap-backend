const bcrypt = require('bcryptjs');

const router = require('express').Router();
const User = require('../models/User');

const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(req.body.password, salt);

		const newUser = await new User({
			username: req.body.username,
			profilePicture: `https://avatars.dicebear.com/api/gridy/${
				req.body.email.split('@')[0]
			}.svg`,
			coverPicture: `http://source.unsplash.com/300x175/?nature,mountains`,
			email: req.body.email,
			password: hashedPassword,
			hometown: req.body.hometown || ' ',
			dob: req.body.dob || ' ',
		});
		await newUser.save();
		const token = jwt.sign(newUser.id, process.env.JWT_SECRET);
		const details = { user: newUser._doc, token: token };
		res.status(200).json(details);
	} catch (error) {
		console.log(error);
		res.send('error adding user');
	}
});

router.post('/login', async (req, res) => {
	try {
		const requestedUser = await User.findOne({ email: req.body.email });
		!requestedUser && res.send('User not found');

		const isPassowrdCorrect = await bcrypt.compare(
			req.body.password,
			requestedUser.password
		);

		!isPassowrdCorrect && res.send('Wrong password');
		const token = jwt.sign(requestedUser.id, process.env.JWT_SECRET);
		const details = { user: requestedUser._doc, token: token };
		res.json(details);
	} catch (error) {
		res.send('some error occured');
	}
});

router.get('/guest', async (req, res) => {
	try {
		const user = await User.findById('61732ba1861997195afcb168');
		const { password, updatedAt, ...others } = user._doc;
		const token = jwt.sign(user.id, process.env.JWT_SECRET);
		const details = { user: others, token: token };
		res.status(200).json(details);
	} catch (error) {
		console.log(error);
		res.send('some error occured');
	}
});

router.get('/verify', (req, res) => {
	const token = req.headers.authorization;
	console.log(req.headers);
	console.log(token);
	try {
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		res.send(verified);
	} catch (error) {
		console.log(error);
		res.send(error);
	}
});

module.exports = router;

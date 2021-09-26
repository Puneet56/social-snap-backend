const bcrypt = require('bcryptjs');

const router = require('express').Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(req.body.password, salt);

		const newUser = await new User({
			username: req.body.username,
			email: req.body.email,
			password: hashedPassword,
		});

		await newUser.save();
		res.status(200).json(newUser);
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

		res.json(requestedUser);
	} catch (error) {
		res.send('some error occured');
	}
});

module.exports = router;

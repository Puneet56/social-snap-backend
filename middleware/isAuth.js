const jwt = require('jsonwebtoken');

const isAuth = (req, res, next) => {
	if (req.method === 'OPTIONS') {
		next();
	}
	const token = req.headers.authorization;

	console.log('token is ', token);
	console.log('User ID is ', req.body.userId);
	try {
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		if (verified === req.body.userId) {
			console.log('verified');
			next();
		} else {
			console.log('unverified');
			// res.status(403).send('Unauthorized');
			next();
		}
	} catch (error) {
		console.log('some error');
		// res.status(500).send('Some error occoured');
		next();
	}
};

module.exports = isAuth;

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cors = require('cors');

const rateLimit = require('express-rate-limit');
const app = express();
// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

const limiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 500, // limit each IP to 500 requests per windowMs
});

//  apply to all requests
app.use(limiter);
// app.set('trust proxy', 1);

const userRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');

dotenv.config();
mongoose.connect(process.env.MONGO_URL, () => {
	console.log('Connected to database');
});

const port = process.env.PORT || 3001;

//middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));
app.use(cors());
app.options('*', cors());

app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});

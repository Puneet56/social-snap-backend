const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');
const isAuth = require('../middleware/isAuth');

//get a post
router.get('/:postId', async (req, res) => {
	try {
		const post = await Post.findOne({ _id: req.params.postId });
		if (post) {
			res.json(post);
		} else {
			res.send('No post found');
		}
	} catch (error) {
		console.log(error);
		res.send('error');
	}
});

//get timeline posts
router.get('/timeline/:userId', async (req, res) => {
	const page = req.query.page;

	try {
		const currentUser = await User.findById(req.params.userId);
		const currentUserPost = await Post.find({ userId: req.params.userId });
		const followingPost = await Promise.all(
			currentUser.following.map((friendId) => Post.find({ userId: friendId }))
		);
		res.json(
			currentUserPost
				.concat(...followingPost)
				.sort((a, b) => b._doc.createdAt - a._doc.createdAt)
				.slice((page - 1) * 5, page * 5)
		);
	} catch (error) {
		console.log(error);
		res.send('some error occoured');
	}
});

//get user posts
router.get('/posts/:userId', async (req, res) => {
	const page = req.query.page;
	try {
		const currentUserPost = await Post.find({ userId: req.params.userId });
		res.json(
			currentUserPost
				.sort((a, b) => b._doc.createdAt - a._doc.createdAt)
				.slice((page - 1) * 5, page * 5)
		);
	} catch (error) {
		console.log(error);
		res.send('some error occoured');
	}
});

router.use(isAuth);

//create a post
router.post('/', async (req, res) => {
	const post = new Post(req.body);
	try {
		const savedPost = await post.save();
		res.status(200).json(savedPost);
	} catch (error) {
		console.log(error);
		res.status(500).send('some error occured');
	}
});

//update a post
router.put('/:postId', async (req, res) => {
	try {
		const post = await Post.findById(req.params.postId);
		if (req.body.userId === post.userId) {
			await post.updateOne({ $set: req.body });
			const updatedPost = await Post.findById(req.params.postId);
			res.status(200).json(updatedPost);
		} else {
			res.status(403).send('You can only update your post');
		}
	} catch (error) {
		console.log(error);
		res.status(500).send('some error occoured');
	}
});

//delete a post
router.put('/:postId/delete', async (req, res) => {
	try {
		const post = await Post.findById(req.params.postId);
		if (post) {
			if (req.body.userId == post.userId) {
				await Post.findByIdAndDelete(post.id);
				res.status(200).send('Post deleted sucessfully');
			} else {
				res.status(403).send('You can only delete your post');
			}
		} else {
			res.status(404).send('Post not found');
		}
	} catch (error) {
		console.log(req.method);
		console.log(error);
		res.status(500).send('some error occoured');
	}
});

//like/unlike a post
router.put('/:postId/like', async (req, res) => {
	try {
		const post = await Post.findById(req.params.postId);
		if (!post.likes.includes(req.body.userId)) {
			await post.updateOne({ $push: { likes: req.body.userId } });
			res
				.status(200)
				.json({ likes: post._doc.likes.length + 1, message: 'post liked' });
		} else {
			await post.updateOne({ $pull: { likes: req.body.userId } });
			res
				.status(200)
				.json({ likes: post._doc.likes.length - 1, message: 'post unliked' });
		}
	} catch (error) {
		console.log(error);
		res.status(500).send('some error occoured');
	}
});

module.exports = router;

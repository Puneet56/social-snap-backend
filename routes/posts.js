const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');

//create a post
router.post('/', async (req, res) => {
	const post = new Post(req.body);

	try {
		const savedPost = await post.save();
		res.json(savedPost);
	} catch (error) {
		console.log(error);
		res.send('some error occured');
	}
});

//update a post
router.put('/:postId', async (req, res) => {
	try {
		const post = await Post.findById(req.params.postId);
		if (req.body.userId === post.userId) {
			await post.updateOne({ $set: req.body });
			const updatedPost = await Post.findById(req.params.postId);
			res.json(updatedPost);
		} else {
			res.send('You can only update your post');
		}
	} catch (error) {
		console.log(error);
		res.send('some error occoured');
	}
});

//delete a post
router.delete('/:postId', async (req, res) => {
	try {
		const post = await Post.findById(req.params.postId);
		if (req.body.userId === post.userId) {
			await post.deleteOne;
			res.send('Post deleted sucessfully');
		} else {
			res.send('You can only delete your post');
		}
	} catch (error) {
		console.log(error);
		res.send('some error occoured');
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
	try {
		const currentUser = await User.findById(req.params.userId);
		const currentUserPost = await Post.find({ userId: req.params.userId });
		const followingPost = await Promise.all(
			currentUser.following.map((friendId) => Post.find({ userId: friendId }))
		);
		res.json(currentUserPost.concat(...followingPost));
	} catch (error) {
		console.log(error);
		res.send('some error occoured');
	}
});

//get user posts

router.get('/posts/:userId', async (req, res) => {
	try {
		const currentUserPost = await Post.find({ userId: req.params.userId });
		res.json(currentUserPost);
	} catch (error) {
		console.log(error);
		res.send('some error occoured');
	}
});

module.exports = router;

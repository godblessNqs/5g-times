const express = require('express');
const Comment = require('../models/Comment');
const jwt = require('jsonwebtoken');

const router = express.Router();

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, 'SECRET_KEY', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

router.post('/comments', authenticateToken, async (req, res) => {
    const { newsId, content } = req.body;
    const comment = new Comment({
        userId: req.user.userId,
        newsId,
        content
    });
    await comment.save();
    res.status(201).json({ message: 'Comment added' });
});

router.get('/comments/:newsId', async (req, res) => {
    const comments = await Comment.find({ newsId: req.params.newsId }).populate('userId', 'username');
    res.json(comments);
});

module.exports = router;

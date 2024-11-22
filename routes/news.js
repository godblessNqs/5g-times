const express = require('express');
const News = require('../models/News');
const { authenticateToken, checkAdmin } = require('./middlewares');

const router = express.Router();

router.get('/news/home', async (req, res) => {
    try {
        const news = await News.find(); // Возвращаем все новости
        res.json(news);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching news.' });
    }
});


// Получение новостей по категории или всех новостей
router.get('/news/:category', async (req, res) => {
    try {
        const { category } = req.params;
        let news;
        
        if (category === 'all') {
            news = await News.find(); // Получаем все новости
        } else {
            news = await News.find({ category }); // Новости по категории
        }

        res.json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Добавить новость (только для администратора)
router.post('/news', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const { title, content, image, category } = req.body;
        const news = new News({ title, content, image, category });
        await news.save();
        res.status(201).json({ message: 'Новость успешно добавлена' });
    } catch (error) {
        res.status(400).json({ error: 'Ошибка добавления новости' });
    }
});

// Редактировать новость (только для администратора)
router.put('/news/:id', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, image, category } = req.body;
        const updatedNews = await News.findByIdAndUpdate(id, { title, content, image, category }, { new: true });
        res.json(updatedNews);
    } catch (error) {
        res.status(400).json({ error: 'Ошибка редактирования новости' });
    }
});

// Удалить новость (только для администратора)
router.delete('/news/:id', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await News.findByIdAndDelete(id);
        res.json({ message: 'Новость успешно удалена' });
    } catch (error) {
        res.status(400).json({ error: 'Ошибка удаления новости' });
    }
});

module.exports = router;

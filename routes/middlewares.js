const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Токен не предоставлен' });

    jwt.verify(token, 'SECRET_KEY', (err, user) => {
        if (err) return res.status(403).json({ error: 'Неверный токен' });
        req.user = user; // Здесь мы добавляем пользователя в запрос
        next();
    });
}

function checkAdmin(req, res, next) {
    if (req.user.role !== 'moderator') {
        return res.status(403).json({ error: 'Доступ разрешен только администраторам' });
    }
    next();
}



module.exports = { authenticateToken, checkAdmin };

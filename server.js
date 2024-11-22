const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const commentRoutes = require('./routes/comments');
const newsRoutes = require('./routes/news');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/5g-times', { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/api/auth', authRoutes);
app.use('/api', commentRoutes);
app.use('/api', newsRoutes);

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

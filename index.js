const express = require('express');
const connectToMongoDB = require('./connection');

const { logReqRes } = require('./middlewares');

const userRouter = require('./routes/user');

const app = express();
const PORT = 8000;

// Connection
connectToMongoDB('mongodb://127.0.0.1:27017/users-app-1').then(() => console.log('MongoDB Connected!'));

// Middleware - Plugin
app.use(express.urlencoded({ extended: false }));
app.use(logReqRes('logs.txt'));

// Routes
app.use('/api/users', userRouter);

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
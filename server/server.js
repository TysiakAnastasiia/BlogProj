import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import movieRoutes from './routes/movies.js';
import likeRoutes from './routes/likes.js';
import commentRoutes from './routes/comments.js';

// Завантаження .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// CORS налаштування
app.use(cors({
  origin: [
    'https://blogproj-p8pr.onrender.com',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Логування запитів (для debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// __dirname для ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// API Роути (ДО статичних файлів!)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Роздача статичних файлів фронтенду
const buildPath = path.join(__dirname, '../my-blog-frontend/build');
app.use(express.static(buildPath));

// Catch-all для React Router (ЗАВЖДИ останнім!)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(buildPath, 'index.html'));
});

// Обробка помилок
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
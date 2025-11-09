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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// __dirname для ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Роутинг
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);

// Роздача фронтенду у production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../my-blog-frontend/build');
  app.use(express.static(buildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(buildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

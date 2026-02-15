import express from 'express';
import pool from '../models/db.js'; 
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST api/likes
// @desc    Додати лайк (для post або movie)
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  try {
    const { post_id, item_type } = req.body;
    const user_id = req.user.id;

    // 1. Перевірка на дублікат лайка (PostgreSQL використовує $1, $2...)
    const { rows: existingLikes } = await pool.query(
      'SELECT * FROM likes WHERE post_id = $1 AND user_id = $2 AND item_type = $3',
      [post_id, user_id, item_type]
    );

    if (existingLikes.length > 0) {
      return res.status(400).json({ message: 'Ви вже поставили лайк цьому об\'єкту' });
    }

    // 2. Вставка нового лайка
    await pool.query(
      'INSERT INTO likes (post_id, user_id, item_type) VALUES ($1, $2, $3)',
      [post_id, user_id, item_type]
    );
    
    res.status(201).json({ message: 'Лайк додано' });

  } catch (err) {
    console.error('Помилка при додаванні лайка:', err); 
    res.status(500).json({ message: 'Помилка сервера', error: err.message });
  }
});

// @route   DELETE api/likes/:itemType/:postId
// @desc    Видалити лайк (дизлайк)
// @access  Private
router.delete('/:itemType/:postId', verifyToken, async (req, res) => {
  try {
    const { postId, itemType } = req.params; 
    const user_id = req.user.id; 

    const { rowCount } = await pool.query(
      'DELETE FROM likes WHERE post_id = $1 AND user_id = $2 AND item_type = $3',
      [postId, user_id, itemType]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Лайк не знайдено' });
    }

    res.json({ message: 'Лайк видалено' });

  } catch (err) {
    console.error('Помилка при видаленні лайка:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

export default router;
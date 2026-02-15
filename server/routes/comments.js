import express from 'express';
import pool from '../models/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST api/comments
// @desc    Додати новий коментар (для post або movie)
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  try {
    const { post_id, content, item_type } = req.body;
    const author_id = req.user.id; 

    // 1. Вставляємо коментар і відразу отримуємо його ID через RETURNING
    const { rows: insertRows } = await pool.query(
      'INSERT INTO comments (post_id, author_id, content, item_type) VALUES ($1, $2, $3, $4) RETURNING id',
      [post_id, author_id, content, item_type]
    );

    const newCommentId = insertRows[0].id;

    // 2. Отримуємо повну інформацію про коментар разом з нікнеймом автора для фронтенду
    const { rows: commentRows } = await pool.query(
      `SELECT 
        c.id, c.post_id, c.author_id, c.content, c.created_at, c.item_type,
        u.username AS author_nickname 
       FROM comments c
       JOIN users u ON c.author_id = u.id
       WHERE c.id = $1`,
      [newCommentId]
    );

    if (commentRows.length === 0) {
      return res.status(404).json({ message: 'Comment created but not found' });
    }

    res.status(201).json(commentRows[0]);

  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE api/comments/:id
// @desc    Видалити коментар (тільки власний)
// @access  Private
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const comment_id = req.params.id;
    const user_id = req.user.id; 

    // 1. Перевіряємо, чи існує коментар і чи належить він поточному користувачу
    const { rows: comments } = await pool.query(
      'SELECT author_id FROM comments WHERE id = $1',
      [comment_id]
    );

    if (comments.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comments[0].author_id !== user_id) {
      return res.status(403).json({ message: 'User not authorized to delete this comment' });
    }

    // 2. Видаляємо коментар
    await pool.query('DELETE FROM comments WHERE id = $1', [comment_id]);

    res.json({ message: 'Comment removed successfully' });

  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
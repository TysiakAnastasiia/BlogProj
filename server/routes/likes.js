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

    const [existingLikes] = await pool.query(
      'SELECT * FROM likes WHERE post_id = ? AND user_id = ? AND item_type = ?',
      [post_id, user_id, item_type]
    );

    if (existingLikes.length > 0) {
      return res.status(400).json({ message: 'Item already liked' });
    }

    await pool.query(
      'INSERT INTO likes (post_id, user_id, item_type) VALUES (?, ?, ?)',
      [post_id, user_id, item_type]
    );
    
    res.status(201).json({ message: 'Like added' });

  } catch (err) {
    console.error('Error adding like:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/likes/:itemType/:postId
// @desc    Видалити лайк (для post або movie)
// @access  Private
router.delete('/:itemType/:postId', verifyToken, async (req, res) => {
  try {
    const { postId, itemType } = req.params; 
    const user_id = req.user.id; 

    await pool.query(
      'DELETE FROM likes WHERE post_id = ? AND user_id = ? AND item_type = ?',
      [postId, user_id, itemType]
    );

    res.json({ message: 'Like removed' });

  } catch (err) {
    console.error('Error removing like:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
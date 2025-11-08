import express from 'express';
import pool from '../models/db.js'; 
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST api/likes
// @desc    Додати лайк
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  try {
    const { post_id } = req.body;
    const user_id = req.user.id;

    const [existingLikes] = await pool.query(
      'SELECT * FROM likes WHERE post_id = ? AND user_id = ?',
      [post_id, user_id]
    );

    if (existingLikes.length > 0) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    await pool.query(
      'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
      [post_id, user_id]
    );
    
    res.status(201).json({ message: 'Like added' });

  } catch (err) {
    console.error('Error adding like:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/likes/:postId
// @desc    Видалити лайк
// @access  Private
router.delete('/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params; 
    const user_id = req.user.id; 

    const [result] = await pool.query(
      'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, user_id]
    );


    res.json({ message: 'Like removed' });

  } catch (err) {
    console.error('Error removing like:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
import pool from '../models/db.js';

// Отримання всіх постів з коментарями та лайками
export const getAllPosts = async (req, res) => {
  const { search } = req.query;
  try {
    // Використовуємо json_agg та json_build_object для поліморфних зв'язків
    // COALESCE забезпечує повернення порожнього масиву [] замість null, якщо даних немає
    let query = `
      SELECT p.*, u.username, 
      COALESCE(
        (SELECT json_agg(json_build_object('id', l.id, 'user_id', l.user_id)) 
         FROM likes l WHERE l.post_id = p.id AND l.item_type = 'post'), '[]'
      ) as likes,
      COALESCE(
        (SELECT json_agg(json_build_object(
          'id', c.id, 
          'content', c.content, 
          'username', cu.username,
          'created_at', c.created_at
        )) 
         FROM comments c 
         JOIN users cu ON c.author_id = cu.id 
         WHERE c.post_id = p.id AND c.item_type = 'post'), '[]'
      ) as comments
      FROM posts p
      JOIN users u ON p.user_id = u.id
    `;
    
    const params = [];
    if (search) {
      // ILIKE у Postgres працює як LIKE, але ігнорує регістр (зручно для пошуку)
      query += ` WHERE p.title ILIKE $1 OR p.content ILIKE $1`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY p.created_at DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: err.message });
  }
};

// Отримання одного поста за ID
export const getPostById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.username FROM posts p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = $1`, 
      [req.params.id]
    );
    
    if (rows.length === 0) return res.status(404).json({ message: 'Post not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Створення нового поста
export const createPost = async (req, res) => {
  const { title, content, image } = req.body;
  try {
    // Додаємо RETURNING *, щоб отримати створений об'єкт одразу
    const { rows } = await pool.query(
      'INSERT INTO posts (user_id, title, content, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title, content, image]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Оновлення поста (тільки власником)
export const updatePost = async (req, res) => {
  const { title, content, image } = req.body;
  try {
    const { rows, rowCount } = await pool.query(
      'UPDATE posts SET title = $1, content = $2, image = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [title, content, image, req.params.id, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(403).json({ message: 'Unauthorized or post not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Видалення поста
export const deletePost = async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2', 
      [req.params.id, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(403).json({ message: 'Unauthorized or not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
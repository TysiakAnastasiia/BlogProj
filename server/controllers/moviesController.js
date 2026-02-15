import pool from '../models/db.js';

// Отримання всіх фільмів з коментарями та лайками
export const getAllMovies = async (req, res) => {
  const { search } = req.query;
  try {
    // Використовуємо json_agg для збору лайків та коментарів у масиви JSON
    // ILIKE дозволяє здійснювати пошук без урахування регістру
    let query = `
      SELECT m.*, u.username,
      COALESCE(
        (SELECT json_agg(json_build_object('id', l.id, 'user_id', l.user_id)) 
         FROM likes l WHERE l.post_id = m.id AND l.item_type = 'movie'), '[]'
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
         WHERE c.post_id = m.id AND c.item_type = 'movie'), '[]'
      ) as comments
      FROM movies m
      JOIN users u ON m.user_id = u.id
    `;
    
    const params = [];
    if (search) {
      query += ` WHERE m.title ILIKE $1 OR m.genre ILIKE $1`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY m.created_at DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).json({ error: err.message });
  }
};

// Отримання одного фільму за ID
export const getMovieById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT m.*, u.username FROM movies m 
       JOIN users u ON m.user_id = u.id 
       WHERE m.id = $1`, 
      [req.params.id]
    );
    
    if (rows.length === 0) return res.status(404).json({ message: 'Movie not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Створення фільму
export const createMovie = async (req, res) => {
  const { title, genre, year, image } = req.body;
  try {
    // У Postgres використовуємо RETURNING *, щоб одразу отримати створений рядок
    const { rows } = await pool.query(
      'INSERT INTO movies (user_id, title, genre, year, image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, title, genre, year, image]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Оновлення фільму
export const updateMovie = async (req, res) => {
  const { title, genre, year, image } = req.body;
  try {
    const { rows, rowCount } = await pool.query(
      'UPDATE movies SET title = $1, genre = $2, year = $3, image = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [title, genre, year, image, req.params.id, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(403).json({ message: 'Unauthorized or movie not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Видалення фільму
export const deleteMovie = async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM movies WHERE id = $1 AND user_id = $2', 
      [req.params.id, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(403).json({ message: 'Unauthorized or not found' });
    }
    res.json({ message: 'Movie deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
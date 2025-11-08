import pool from '../models/db.js';

export const getAllMovies = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const query = `
      SELECT 
        m.*, 
        u.username AS author_nickname, -- <--- НОВИЙ РЯДОК
        (SELECT COUNT(*) > 0 FROM likes l WHERE l.post_id = m.id AND l.user_id = ?) AS likedByMe,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = m.id) AS likes, 
        (
          SELECT IFNULL(JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', c.id,
              'content', c.content,
              'created_at', c.created_at,
              'author_id', c.author_id,
              'author_nickname', u_comment.username
            )
          ), '[]')
          FROM comments c
          JOIN users u_comment ON c.author_id = u_comment.id
          WHERE c.post_id = m.id 
        ) AS comments
      FROM movies m
      JOIN users u ON m.created_by = u.id -- <--- НОВИЙ JOIN
      ORDER BY m.created_at DESC;
    `;
    
    const [movies] = await pool.query(query, [userId]);
    
    const formattedMovies = movies.map(movie => ({
      ...movie,
      comments: JSON.parse(movie.comments),
      likedByMe: movie.likedByMe === 1
    }));

    res.json(formattedMovies);

  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMovieById = async (req, res) => {
  const { id } = req.params;
  try {
    const [movies] = await pool.query("SELECT * FROM movies WHERE id=?", [id]);
    if (movies.length === 0) return res.status(404).json({ message: "Movie not found" });
    res.json(movies[0]);
  } catch (err) {
    console.error('Get movie by id error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const createMovie = async (req, res) => {
  console.log('🎬 Creating movie - received data:', req.body);
  
  const { title, genre, year, image_url, created_by } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }
  if (!created_by) {
    return res.status(400).json({ message: "Created by (user ID) is required" });
  }
  
  try {
    const [result] = await pool.query(
      "INSERT INTO movies (title, genre, year, image_url, created_by) VALUES (?, ?, ?, ?, ?)", 
      [title, genre || null, year || null, image_url || null, created_by]
    );
    
    res.status(201).json({ 
      message: "Movie created", 
      movieId: result.insertId,
    });
  } catch (err) {
    console.error('❌ Create movie error:', err);
    res.status(500).json({ message: "Server error", error: err.message, sqlMessage: err.sqlMessage });
  }
};

export const updateMovie = async (req, res) => {
  const { id } = req.params;
  const { title, genre, year, image_url } = req.body;
  
  try {
    const [result] = await pool.query(
      "UPDATE movies SET title=?, genre=?, year=?, image_url=? WHERE id=?", 
      [title, genre, year, image_url, id]
    );
    
    res.json({ message: "Movie updated", affectedRows: result.affectedRows });
  } catch (err) {
    console.error('❌ Update movie error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteMovie = async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query("DELETE FROM likes WHERE post_id = ?", [id]);
    await pool.query("DELETE FROM comments WHERE post_id = ?", [id]);
    
    const [result] = await pool.query("DELETE FROM movies WHERE id=?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }
    
    res.json({ message: "Movie deleted", affectedRows: result.affectedRows });
  } catch (err) {
    console.error('❌ Delete movie error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
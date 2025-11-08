import pool from '../models/db.js';

export const getAllMovies = async (req, res) => {
  const { userId, search } = req.query; 

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const params = [userId]; 
    
    let query = `
      SELECT 
        m.*, 
        u.username AS author_nickname, 
        (SELECT COUNT(*) > 0 FROM likes l WHERE l.post_id = m.id AND l.user_id = ? AND l.item_type = 'movie') AS likedByMe,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = m.id AND l.item_type = 'movie') AS likes, 
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
          WHERE c.post_id = m.id AND c.item_type = 'movie'
        ) AS comments
      FROM movies m
      JOIN users u ON m.user_id = u.id
    `;

    if (search) {
      query += `
        WHERE (m.title LIKE ? OR m.genre LIKE ?)
      `;
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY m.created_at DESC;`;

    const [movies] = await pool.query(query, params);
    
    const formattedMovies = movies.map(movie => ({
      ...movie,
      comments: JSON.parse(movie.comments),
      likedByMe: movie.likedByMe === 1
    }));

    res.json(formattedMovies);

  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).json({ message: "Server error", error: err.message });
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
  const { title, genre, year, image, user_id } = req.body; 
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }
  if (!user_id) {
    return res.status(400).json({ message: "User ID is required" });
  }
  
  try {
    const [result] = await pool.query(
      "INSERT INTO movies (title, genre, year, image, user_id) VALUES (?, ?, ?, ?, ?)", 
      [title, genre || null, year || null, image || null, user_id]
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
  const { title, genre, year, image } = req.body;
  
  try {
    const [result] = await pool.query(
      "UPDATE movies SET title=?, genre=?, year=?, image=? WHERE id=?", 
      [title, genre, year, image, id]
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
    await pool.query("DELETE FROM likes WHERE post_id = ? AND item_type = 'movie'", [id]);
    await pool.query("DELETE FROM comments WHERE post_id = ? AND item_type = 'movie'", [id]);
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
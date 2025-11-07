import pool from '../models/db.js';

// GET всі фільми
export const getAllMovies = async (req, res) => {
  try {
    const [movies] = await pool.query("SELECT * FROM movies");
    res.json(movies);
  } catch (err) {
    console.error('Get all movies error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET один фільм
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

// POST створити фільм
export const createMovie = async (req, res) => {
  console.log('🎬 Creating movie - received data:', req.body);
  
  const { title, genre, year, image_url, created_by } = req.body;
  
  // Валідація обов'язкових полів
  if (!title) {
    console.log('❌ Validation failed: title is required');
    return res.status(400).json({ message: "Title is required" });
  }
  
  if (!created_by) {
    console.log('❌ Validation failed: created_by is required');
    return res.status(400).json({ message: "Created by (user ID) is required" });
  }
  
  try {
    console.log('💾 Inserting into database:', { title, genre, year, image_url, created_by });
    
    const [result] = await pool.query(
      "INSERT INTO movies (title, genre, year, image_url, created_by) VALUES (?, ?, ?, ?, ?)", 
      [title, genre || null, year || null, image_url || null, created_by]
    );
    
    console.log('✅ Movie created successfully:', result);
    
    res.status(201).json({ 
      message: "Movie created", 
      movieId: result.insertId,
      affectedRows: result.affectedRows 
    });
  } catch (err) {
    console.error('❌ Create movie error:', err);
    res.status(500).json({ message: "Server error", error: err.message, sqlMessage: err.sqlMessage });
  }
};

// PUT редагувати фільм
export const updateMovie = async (req, res) => {
  const { id } = req.params;
  const { title, genre, year, image_url } = req.body;
  
  console.log('🎬 Updating movie:', id, 'with data:', req.body);
  
  try {
    const [result] = await pool.query(
      "UPDATE movies SET title=?, genre=?, year=?, image_url=? WHERE id=?", 
      [title, genre, year, image_url, id]
    );
    
    console.log('✅ Movie updated:', result);
    
    res.json({ message: "Movie updated", affectedRows: result.affectedRows });
  } catch (err) {
    console.error('❌ Update movie error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE фільм
export const deleteMovie = async (req, res) => {
  const { id } = req.params;
  
  console.log('🗑️ Deleting movie:', id);
  
  try {
    const [result] = await pool.query("DELETE FROM movies WHERE id=?", [id]);
    
    console.log('✅ Movie deleted:', result);
    
    res.json({ message: "Movie deleted", affectedRows: result.affectedRows });
  } catch (err) {
    console.error('❌ Delete movie error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
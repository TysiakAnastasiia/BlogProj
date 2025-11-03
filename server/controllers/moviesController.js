import { db } from "../config.js";

// GET всі фільми
export const getAllMovies = async (req, res) => {
  try {
    const [movies] = await db.query("SELECT * FROM movies");
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET один фільм
export const getMovieById = async (req, res) => {
  const { id } = req.params;
  try {
    const [movies] = await db.query("SELECT * FROM movies WHERE id=?", [id]);
    if (movies.length === 0) return res.status(404).json({ message: "Movie not found" });
    res.json(movies[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST створити фільм
export const createMovie = async (req, res) => {
  const { title, genre, year, image } = req.body;
  try {
    const [result] = await db.query("INSERT INTO movies (title, genre, year, image) VALUES (?, ?, ?, ?)", [title, genre, year, image]);
    res.status(201).json({ message: "Movie created", movieId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT редагувати фільм
export const updateMovie = async (req, res) => {
  const { id } = req.params;
  const { title, genre, year, image } = req.body;
  try {
    const [result] = await db.query("UPDATE movies SET title=?, genre=?, year=?, image=? WHERE id=?", [title, genre, year, image, id]);
    res.json({ message: "Movie updated", affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE фільм
export const deleteMovie = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM movies WHERE id=?", [id]);
    res.json({ message: "Movie deleted", affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

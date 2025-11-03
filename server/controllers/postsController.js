import { db } from "../config.js";

// GET всі пости
export const getAllPosts = async (req, res) => {
  try {
    const [posts] = await db.query("SELECT * FROM posts");
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET одного поста
export const getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const [posts] = await db.query("SELECT * FROM posts WHERE id = ?", [id]);
    if (posts.length === 0) return res.status(404).json({ message: "Post not found" });
    res.json(posts[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST створити пост
export const createPost = async (req, res) => {
  const { title, content, image, user_id } = req.body;
  try {
    const [result] = await db.query("INSERT INTO posts (title, content, image, user_id) VALUES (?, ?, ?, ?)", [title, content, image, user_id]);
    res.status(201).json({ message: "Post created", postId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT редагувати пост
export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, image } = req.body;
  try {
    const [result] = await db.query("UPDATE posts SET title=?, content=?, image=? WHERE id=?", [title, content, image, id]);
    res.json({ message: "Post updated", affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE пост
export const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM posts WHERE id=?", [id]);
    res.json({ message: "Post deleted", affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

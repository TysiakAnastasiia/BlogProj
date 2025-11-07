import pool from '../models/db.js';

// GET всі пости
export const getAllPosts = async (req, res) => {
  try {
    const [posts] = await pool.query("SELECT * FROM posts");
    res.json(posts);
  } catch (err) {
    console.error('Get all posts error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET одного поста
export const getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const [posts] = await pool.query("SELECT * FROM posts WHERE id = ?", [id]);
    if (posts.length === 0) return res.status(404).json({ message: "Post not found" });
    res.json(posts[0]);
  } catch (err) {
    console.error('Get post by id error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST створити пост
export const createPost = async (req, res) => {
  console.log('📝 Creating post - received data:', req.body);
  
  const { title, content, image, user_id } = req.body;
  
  // Валідація
  if (!title) {
    console.log('❌ Validation failed: title is required');
    return res.status(400).json({ message: "Title is required" });
  }
  
  if (!user_id) {
    console.log('❌ Validation failed: user_id is required');
    return res.status(400).json({ message: "User ID is required" });
  }
  
  try {
    console.log('💾 Inserting into database:', { title, content, image, user_id });
    
    const [result] = await pool.query(
      "INSERT INTO posts (title, content, image, user_id) VALUES (?, ?, ?, ?)", 
      [title, content || null, image || null, user_id]
    );
    
    console.log('✅ Post created successfully:', result);
    
    res.status(201).json({ 
      message: "Post created", 
      postId: result.insertId,
      affectedRows: result.affectedRows 
    });
  } catch (err) {
    console.error('❌ Create post error:', err);
    res.status(500).json({ message: "Server error", error: err.message, sqlMessage: err.sqlMessage });
  }
};

// PUT редагувати пост
export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, image } = req.body;
  
  console.log('📝 Updating post:', id, 'with data:', req.body);
  
  try {
    const [result] = await pool.query(
      "UPDATE posts SET title=?, content=?, image=? WHERE id=?", 
      [title, content, image, id]
    );
    
    console.log('✅ Post updated:', result);
    
    res.json({ message: "Post updated", affectedRows: result.affectedRows });
  } catch (err) {
    console.error('❌ Update post error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE пост
export const deletePost = async (req, res) => {
  const { id } = req.params;
  
  console.log('🗑️ Deleting post:', id);
  
  try {
    const [result] = await pool.query("DELETE FROM posts WHERE id=?", [id]);
    
    console.log('✅ Post deleted:', result);
    
    res.json({ message: "Post deleted", affectedRows: result.affectedRows });
  } catch (err) {
    console.error('❌ Delete post error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
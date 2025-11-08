import pool from '../models/db.js';

export const getAllPosts = async (req, res) => {
  const { userId, search } = req.query; 

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required to fetch posts' });
  }

  try {
    const params = [userId];
    
    let query = `
      SELECT 
        p.*, 
        u.username AS author_nickname,
        (SELECT COUNT(*) > 0 FROM likes l WHERE l.post_id = p.id AND l.user_id = ? AND l.item_type = 'post') AS likedByMe,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.item_type = 'post') AS likes, 
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
          WHERE c.post_id = p.id AND c.item_type = 'post'
        ) AS comments
      FROM posts p
      JOIN users u ON p.user_id = u.id
    `;

    if (search) {
      query += `
        WHERE (p.title LIKE ? OR p.content LIKE ?)
      `;
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    query += ` ORDER BY p.created_at DESC;`;

    const [posts] = await pool.query(query, params);
    
    const formattedPosts = posts.map(post => ({
      ...post,
      comments: JSON.parse(post.comments),
      likedByMe: post.likedByMe === 1
    }));

    res.json(formattedPosts);

  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

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

export const createPost = async (req, res) => {
  const { title, content, image, user_id } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }
  if (!user_id) {
    return res.status(400).json({ message: "User ID is required" });
  }
  
  try {
    const [result] = await pool.query(
      "INSERT INTO posts (title, content, image, user_id) VALUES (?, ?, ?, ?)", 
      [title, content || null, image || null, user_id]
    );
    res.status(201).json({ 
      message: "Post created", 
      postId: result.insertId,
    });
  } catch (err) {
    console.error('❌ Create post error:', err);
    res.status(500).json({ message: "Server error", error: err.message, sqlMessage: err.sqlMessage });
  }
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, image } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE posts SET title=?, content=?, image=? WHERE id=?", 
      [title, content, image, id]
    );
    res.json({ message: "Post updated", affectedRows: result.affectedRows });
  } catch (err) {
    console.error('❌ Update post error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM likes WHERE post_id = ? AND item_type = 'post'", [id]);
    await pool.query("DELETE FROM comments WHERE post_id = ? AND item_type = 'post'", [id]);
    const [result] = await pool.query("DELETE FROM posts WHERE id=?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted", affectedRows: result.affectedRows });
  } catch (err) {
    console.error('❌ Delete post error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
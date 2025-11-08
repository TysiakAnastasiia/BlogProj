import pool from '../models/db.js';

export const getAllPosts = async (req, res) => {
    const userId = req.query.userId; 
    const searchQuery = req.query.search; 

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required to fetch posts' });
    }

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
    
    const queryParams = [userId];

    if (searchQuery) {
        query += `
            WHERE p.title LIKE ? OR p.content LIKE ?
        `;
        const searchPattern = `%${searchQuery}%`;
        queryParams.push(searchPattern, searchPattern);
    }

    query += ` ORDER BY p.created_at DESC;`;

    try {
        const [posts] = await pool.query(query, queryParams);
        
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
    
    if (!title || title.trim().length < 3) { 
        return res.status(400).json({ message: "Title must be at least 3 characters long." });
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
    const editorId = req.user.id; // ID з токена

    if (!title || title.trim().length < 3) { // ВАЛІДАЦІЯ
        return res.status(400).json({ message: "Title must be at least 3 characters long." });
    }

    try {
        // ПЕРЕВІРКА ВЛАСНОСТІ
        const [post] = await pool.query("SELECT user_id FROM posts WHERE id = ?", [id]);
        if (post.length === 0) return res.status(404).json({ message: "Post not found" });
        if (post[0].user_id !== editorId) {
            return res.status(403).json({ message: "Ви не маєте прав редагувати цей пост." });
        }

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
    const deleterId = req.user.id; 
    
    try {
        const [post] = await pool.query("SELECT user_id FROM posts WHERE id = ?", [id]);
        if (post.length === 0) return res.status(404).json({ message: "Post not found" });
        if (post[0].user_id !== deleterId) {
            return res.status(403).json({ message: "Ви не маєте прав видаляти цей пост." });
        }

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
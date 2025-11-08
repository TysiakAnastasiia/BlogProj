import pool from "../models/db.js";
import bcrypt from "bcryptjs";

// --- ФУНКЦІЇ ДЛЯ ПІДПИСКИ ---

export const followUser = async (req, res) => {
  const followerId = req.user.id;
  const followingId = req.params.id;

  if (followerId == followingId) {
    return res.status(400).json({ message: "Ви не можете підписатися самі на себе" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT * FROM follows WHERE follower_id = ? AND following_id = ?",
      [followerId, followingId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Ви вже підписані на цього користувача" });
    }

    await pool.query(
      "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)",
      [followerId, followingId]
    );

    res.status(201).json({ message: "Підписка успішно створена" });
  } catch (error) {
    console.error("Помилка при підписці:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

export const unfollowUser = async (req, res) => {
  const followerId = req.user.id;
  const followingId = req.params.id;

  try {
    const [result] = await pool.query(
      "DELETE FROM follows WHERE follower_id = ? AND following_id = ?",
      [followerId, followingId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Ви не були підписані на цього користувача" });
    }

    res.status(200).json({ message: "Підписка успішно скасована" });
  } catch (error) {
    console.error("Помилка при відписці:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};


// --- ОНОВЛЕНІ ФУНКЦІЇ ОТРИМАННЯ ДАНИХ ---

// Отримати користувача за ID (для сторінки іншого користувача)
export const getUserById = async (req, res) => {
  const profileId = req.params.id;
  const viewerId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT 
        u.id, u.first_name, u.last_name, u.username, u.email, u.phone, u.birth_date, u.avatar_url, u.created_at,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following,
        (SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = u.id) > 0 AS isFollowing
      FROM users u
      WHERE u.id = ?`,
      [viewerId, profileId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    // Отримуємо ТІЛЬКИ пости цього користувача
    const [posts] = await pool.query(
      `SELECT 
        p.id, p.title, p.content, p.image, p.created_at, p.user_id,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.item_type = 'post') AS likes
      FROM posts p 
      WHERE p.user_id = ? 
      ORDER BY p.created_at DESC`, 
      [profileId]
    );

    // Отримуємо ТІЛЬКИ movies цього користувача
    const [movies] = await pool.query(
      `SELECT 
        m.id, m.title, m.genre, m.year, m.image, m.created_at, m.user_id,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = m.id AND l.item_type = 'movie') AS likes
      FROM movies m 
      WHERE m.user_id = ? 
      ORDER BY m.created_at DESC`, 
      [profileId]
    );

    const user = rows[0];
    user.isFollowing = !!user.isFollowing;
    user.posts = posts;
    user.movies = movies;
    user.watched = movies.length;

    res.json(user);

  } catch (error) {
    console.error("Помилка при отриманні користувача:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

// Отримати власний профіль (на основі токена)
export const getMe = async (req, res) => {
  const userId = req.user.id;
  try {
    console.log("🔍 Getting profile for user ID:", userId);

    const [rows] = await pool.query(
      `SELECT 
        u.id, u.first_name, u.last_name, u.username, u.email, u.phone, u.birth_date, u.avatar_url, u.created_at,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following
      FROM users u
      WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    // Отримуємо ТІЛЬКИ пости цього користувача
    const [posts] = await pool.query(
      `SELECT 
        p.id, p.title, p.content, p.image, p.created_at, p.user_id,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.item_type = 'post') AS likes
      FROM posts p 
      WHERE p.user_id = ? 
      ORDER BY p.created_at DESC`, 
      [userId]
    );

    // Отримуємо ТІЛЬКИ movies цього користувача
    const [movies] = await pool.query(
      `SELECT 
        m.id, m.title, m.genre, m.year, m.image, m.created_at, m.user_id,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = m.id AND l.item_type = 'movie') AS likes
      FROM movies m 
      WHERE m.user_id = ? 
      ORDER BY m.created_at DESC`, 
      [userId]
    );

    const user = rows[0];
    user.posts = posts;
    user.movies = movies;
    user.watched = movies.length;

    console.log("✅ Profile found with", posts.length, "posts and", movies.length, "movies");
    res.json(user);
  } catch (error) {
    console.error("❌ Помилка при отриманні профілю:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

// Оновити профіль
export const updateUser = async (req, res) => {
  try {
    let userId;
    if (req.path === "/me" || req.route.path === "/me") {
      userId = req.user.id;
    } else {
      userId = parseInt(req.params.id);
    }
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const { first_name, last_name, username, email, phone, birth_date, avatar, password } = req.body;

    if (req.path !== "/me" && req.route.path !== "/me" && parseInt(req.user.id) !== parseInt(userId)) {
      return res.status(403).json({ message: "Ви не маєте прав редагувати цей профіль" });
    }

    let hashedPassword = null;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    if (hashedPassword) {
      await pool.query(
        `UPDATE users
         SET first_name=?, last_name=?, username=?, email=?, phone=?, birth_date=?, avatar_url=?, password=?
         WHERE id=?`,
        [first_name, last_name, username, email, phone, birth_date, avatar, hashedPassword, userId]
      );
    } else {
      await pool.query(
        `UPDATE users
         SET first_name=?, last_name=?, username=?, email=?, phone=?, birth_date=?, avatar_url=?
         WHERE id=?`,
        [first_name, last_name, username, email, phone, birth_date, avatar, userId]
      );
    }

    const [updatedUser] = await pool.query(
      "SELECT id, first_name, last_name, username, email, phone, birth_date, avatar_url, created_at FROM users WHERE id = ?",
      [userId]
    );

    res.json({ message: "Профіль оновлено успішно", user: updatedUser[0] });
  } catch (error) {
    console.error("❌ Помилка оновлення профілю:", error);
    res.status(500).json({ message: "Помилка оновлення профілю", error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, first_name, last_name, username, email, phone, birth_date, avatar_url, created_at FROM users"
    );
    res.json(users);
  } catch (error) {
    console.error("Помилка при отриманні користувачів:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};
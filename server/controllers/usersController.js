import pool from "../models/db.js";
import bcrypt from "bcryptjs";

// --- НОВІ ФУНКЦІЇ ДЛЯ ПІДПИСКИ ---

export const followUser = async (req, res) => {
  const followerId = req.user.id; // ID того, хто підписується (з токена)
  const followingId = req.params.id; // ID того, на кого підписуються (з URL)

  // Перевірка на само-підписку
  if (followerId == followingId) {
    return res.status(400).json({ message: "Ви не можете підписатися самі на себе" });
  }

  try {
    // Перевірка, чи підписка вже існує
    const [existing] = await pool.query(
      "SELECT * FROM follows WHERE follower_id = ? AND following_id = ?",
      [followerId, followingId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Ви вже підписані на цього користувача" });
    }

    // Створення підписки
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
  const followerId = req.user.id; // ID того, хто відписується
  const followingId = req.params.id; // ID того, від кого відписуються

  try {
    const [result] = await pool.query(
      "DELETE FROM follows WHERE follower_id = ? AND following_id = ?",
      [followerId, followingId]
    );

    if (result.affectedRows === 0) {
      // Це не критична помилка, але корисно знати
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
  const profileId = req.params.id; // ID профілю, який ми дивимось
  const viewerId = req.user.id;   // ID того, хто дивиться (з токена)

  try {
    // Великий запит, який робить все:
    // 1. Бере дані користувача
    // 2. Рахує його підписників (followers)
    // 3. Рахує його підписки (following)
    // 4. Перевіряє, чи ви (viewer) підписані на нього (isFollowing)
    const [rows] = await pool.query(
      `SELECT 
        u.id, u.first_name, u.last_name, u.username, u.email, u.phone, u.birth_date, u.avatar_url, u.created_at,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following,
        (SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = u.id) > 0 AS isFollowing
      FROM users u
      WHERE u.id = ?`,
      [viewerId, profileId] // [viewerId] -> ?, [profileId] -> u.id
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    // Отримуємо пости користувача (як очікує фронтенд)
    // Я припускаю, що ваша таблиця постів називається 'posts', а колонка 'user_id'
    const [posts] = await pool.query(
      "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC", 
      [profileId]
    );

    const user = rows[0];
    // 'isFollowing' - це 1 (true) або 0 (false), конвертуємо в boolean
    user.isFollowing = !!user.isFollowing; 
    user.posts = posts; // Додаємо пости до відповіді

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

    // Схожий запит, але без 'isFollowing' (ви не можете бути підписані самі на себе)
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

    // Також отримуємо пости
    const [posts] = await pool.query(
      "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC", 
      [userId]
    );

    const user = rows[0];
    user.posts = posts; // Додаємо пости до об'єкта користувача

    console.log("✅ Profile found:", user);
    res.json(user);
  } catch (error) {
    console.error("❌ Помилка при отриманні профілю:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

// --- Існуюча функція updateUser (без змін) ---
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

// Функція getAllUsers залишається без змін, оскільки вона не потрібна для логіки профілів
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
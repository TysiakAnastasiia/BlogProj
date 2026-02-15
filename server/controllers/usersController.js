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
    // У Postgres можна використовувати ON CONFLICT, щоб уникнути зайвого SELECT
    const { rowCount } = await pool.query(
      "INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [followerId, followingId]
    );

    if (rowCount === 0) {
      return res.status(400).json({ message: "Ви вже підписані на цього користувача" });
    }

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
    const { rowCount } = await pool.query(
      "DELETE FROM follows WHERE follower_id = $1 AND following_id = $2",
      [followerId, followingId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Підписку не знайдено" });
    }

    res.json({ message: "Ви відписалися від користувача" });
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};

// --- ПРОФІЛЬ ТА КОРИСТУВАЧІ ---

export const getUserProfile = async (req, res) => {
  const userId = req.params.id;
  try {
    const { rows: userRows } = await pool.query(
      "SELECT id, first_name, last_name, username, email, phone, birth_date, avatar_url, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    const user = userRows[0];

    // Підрахунок фоловерів та підписок
    const { rows: followers } = await pool.query("SELECT COUNT(*) FROM follows WHERE following_id = $1", [userId]);
    const { rows: following } = await pool.query("SELECT COUNT(*) FROM follows WHERE follower_id = $1", [userId]);

    res.json({
      ...user,
      followersCount: parseInt(followers[0].count),
      followingCount: parseInt(following[0].count),
    });
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { first_name, last_name, username, email, phone, birth_date, avatar, password } = req.body;

  try {
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let updateQuery;
    let params;

    if (hashedPassword) {
      updateQuery = `
        UPDATE users
        SET first_name=$1, last_name=$2, username=$3, email=$4, phone=$5, birth_date=$6, avatar_url=$7, password=$8
        WHERE id=$9 RETURNING id, first_name, last_name, username, email, phone, birth_date, avatar_url, created_at`;
      params = [first_name, last_name, username, email, phone, birth_date, avatar, hashedPassword, userId];
    } else {
      updateQuery = `
        UPDATE users
        SET first_name=$1, last_name=$2, username=$3, email=$4, phone=$5, birth_date=$6, avatar_url=$7
        WHERE id=$8 RETURNING id, first_name, last_name, username, email, phone, birth_date, avatar_url, created_at`;
      params = [first_name, last_name, username, email, phone, birth_date, avatar, userId];
    }

    const { rows } = await pool.query(updateQuery, params);

    res.json({ message: "Профіль оновлено успішно", user: rows[0] });
  } catch (error) {
    console.error("❌ Помилка оновлення профілю:", error);
    res.status(500).json({ message: "Помилка оновлення профілю", error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  const { search } = req.query;
  try {
    let query = "SELECT id, username, first_name, last_name, avatar_url FROM users";
    const params = [];

    if (search) {
      query += " WHERE username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1";
      params.push(`%${search}%`);
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання користувачів", error: error.message });
  }
};
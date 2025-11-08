import pool from "../models/db.js";
import bcrypt from "bcryptjs";

// Отримати всіх користувачів
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

// Отримати користувача за ID
export const getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, first_name, last_name, username, email, phone, birth_date, avatar_url, created_at FROM users WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Помилка при отриманні користувача:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

// Отримати власний профіль (на основі токена)
export const getMe = async (req, res) => {
  try {
    console.log("🔍 Getting profile for user ID:", req.user.id);
    
    const [rows] = await pool.query(
      "SELECT id, first_name, last_name, username, email, phone, birth_date, avatar_url, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }
    
    console.log("✅ Profile found:", rows[0]);
    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Помилка при отриманні профілю:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

// Оновити дані користувача
export const updateUser = async (req, res) => {
  try {
    console.log("📍 req.path:", req.path);
    console.log("📍 req.route.path:", req.route.path);
    console.log("📍 req.params:", req.params);
    
    // ✅ ВИПРАВЛЕНО: Перевіряємо req.path або req.route.path
    let userId;
    if (req.path === "/me" || req.route.path === "/me") {
      console.log("✅ Route is /me, using user from token");
      userId = req.user.id;
    } else {
      console.log("⚠️ Route is /:id, parsing ID from params");
      userId = parseInt(req.params.id);
    }
    
    console.log("📝 Updating user:", userId);
    console.log("👤 Current user from token:", req.user.id);
    console.log("📦 Update data:", req.body);
    
    if (isNaN(userId)) {
      console.log("❌ userId is NaN!");
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const { first_name, last_name, username, email, phone, birth_date, avatar, password } = req.body;

    // Перевірка прав доступу ТІЛЬКИ якщо це НЕ /me
    if (req.path !== "/me" && req.route.path !== "/me" && parseInt(req.user.id) !== parseInt(userId)) {
      console.log("❌ Access denied:", parseInt(req.user.id), "!==", parseInt(userId));
      return res.status(403).json({ message: "Ви не маєте прав редагувати цей профіль" });
    }

    console.log("✅ Access granted");

    // Якщо є новий пароль - хешуємо
    let hashedPassword = null;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log("🔒 Password will be updated");
    }

    // Оновлюємо профіль
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

    console.log("✅ User updated successfully");

    // Повертаємо оновлені дані
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
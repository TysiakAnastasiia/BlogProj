import pool from "../models/db.js";

// Отримати всіх користувачів
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT * FROM users");
    res.json(users);
  } catch (error) {
    console.error("Помилка при отриманні користувачів:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

// Отримати користувача за ID
export const getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
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
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Помилка при отриманні профілю:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

// Оновити дані користувача (включно з /me)
export const updateUser = async (req, res) => {
  try {
    // Якщо /me → замінюємо на ID користувача з токена
    const id = req.params.id === "me" ? req.user.id : req.params.id;
    const { first_name, last_name, username, email, phone, birth_date } = req.body;

    await pool.query(
      `UPDATE users
       SET first_name=?, last_name=?, username=?, email=?, phone=?, birth_date=?
       WHERE id=?`,
      [first_name, last_name, username, email, phone, birth_date, id]
    );

    res.json({ message: "Профіль оновлено успішно" });
  } catch (error) {
    console.error("Помилка оновлення профілю:", error);
    res.status(500).json({ message: "Помилка оновлення профілю" });
  }
};

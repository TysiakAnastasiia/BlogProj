import { db } from "../config.js";
import bcrypt from "bcryptjs";

// GET всі користувачі
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, first_name, last_name, username, email, phone, birth_date, created_at FROM users");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET одного користувача
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [users] = await db.query("SELECT id, first_name, last_name, username, email, phone, birth_date, created_at FROM users WHERE id = ?", [id]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT редагувати користувача
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, username, email, phone, birth_date, password } = req.body;

  try {
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const [result] = await db.query(
      `UPDATE users SET first_name=?, last_name=?, username=?, email=?, phone=?, birth_date=? ${hashedPassword ? ", password=?" : ""} WHERE id=?`,
      hashedPassword
        ? [first_name, last_name, username, email, phone, birth_date, hashedPassword, id]
        : [first_name, last_name, username, email, phone, birth_date, id]
    );

    res.json({ message: "User updated", affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

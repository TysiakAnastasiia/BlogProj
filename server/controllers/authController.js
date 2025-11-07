import pool from '../models/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Реєстрація
export const register = async (req, res) => {
  const { first_name, last_name, username, email, password, phone, birth_date } = req.body;

  try {
    // Перевірка, чи існує користувач
    const [existing] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Хешуємо пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Додаємо користувача в БД
    const [result] = await pool.query(
      'INSERT INTO users (first_name, last_name, username, email, password, phone, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, username, email, hashedPassword, phone, birth_date]
    );

    res.status(201).json({ message: 'User created', userId: result.insertId });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Логін
export const login = async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [usernameOrEmail, usernameOrEmail]);
    if (users.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    // Генеруємо JWT (краще винести секрет в .env)
    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      process.env.JWT_SECRET || 'your_secret_key_change_this_in_production', 
      { expiresIn: '1d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        first_name: user.first_name, 
        last_name: user.last_name 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
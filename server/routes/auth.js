import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// Реєстрація нового користувача
router.post('/register', register);

// Логін (вхід у систему)
router.post('/login', login);

export default router;
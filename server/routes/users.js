import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  getMe,
  followUser,    // <-- 1. Імпортуємо нові функції
  unfollowUser,  // <-- 2. Імпортуємо нові функції
} from "../controllers/usersController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Маршрути для власного профілю
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateUser);

// --- 3. ДОДАЄМО НОВІ МАРШРУТИ ---
router.post("/:id/follow", verifyToken, followUser);
router.post("/:id/unfollow", verifyToken, unfollowUser);

// Загальні маршрути
router.get("/", getAllUsers); // Можна залишити без verifyToken, якщо це публічна інфо
router.get("/:id", verifyToken, getUserById); // <-- 4. ДОДАЄМО verifyToken
router.put("/:id", verifyToken, updateUser); // Вже має verifyToken, це добре

export default router;
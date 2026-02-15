import express from "express";
import {
  getAllUsers,
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
} from "../controllers/usersController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- МАРШРУТИ ДЛЯ ПРОФІЛЮ (СЕБЕ) ---

// Отримати дані поточного авторизованого користувача
// Ми використовуємо getUserProfile і передаємо 'me' або обробляємо через req.user.id у контролері
router.get("/me", verifyToken, (req, res) => {
    // Перенаправляємо на загальний пошук за ID, але беремо ID з токена
    req.params.id = req.user.id;
    getUserProfile(req, res);
});

// Оновити власний профіль
router.put("/me", verifyToken, updateProfile);


// --- МАРШРУТИ ДЛЯ ПІДПИСОК ---

// Підписатися на користувача за його ID
router.post("/:id/follow", verifyToken, followUser);

// Відписатися від користувача за його ID
router.post("/:id/unfollow", verifyToken, unfollowUser);


// --- ЗАГАЛЬНІ МАРШРУТИ ---

// Отримати список усіх користувачів (з можливістю пошуку через ?search=)
router.get("/", getAllUsers);

// Отримати профіль конкретного користувача за ID
router.get("/:id", verifyToken, getUserProfile);

// Оновити профіль конкретного користувача (адмінська дія або для розширення)
router.put("/:id", verifyToken, updateProfile);

export default router;
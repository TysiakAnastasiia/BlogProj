import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  getMe,
} from "../controllers/usersController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", verifyToken, getMe); 
router.put("/me", verifyToken, updateUser);

// Загальні маршрути
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", verifyToken, updateUser);

export default router;
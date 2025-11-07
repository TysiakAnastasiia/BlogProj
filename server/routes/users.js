import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  getMe,
} from "../controllers/usersController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/me", verifyToken, getMe); 
router.get("/:id", getUserById);
router.put("/:id", updateUser);

export default router;

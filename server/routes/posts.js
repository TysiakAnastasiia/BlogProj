import express from "express";
import { 
    getAllPosts, 
    getPostById, 
    createPost, 
    updatePost, 
    deletePost 
} from "../controllers/postsController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// Отримати всі пости (публічно, але з ID юзера для лайків у query)
router.get("/", getAllPosts);

// Отримати один пост за ID
router.get("/:id", getPostById);

// --- ЗАХИЩЕНІ МАРШРУТИ ---
// Створити пост (тільки залогінені)
router.post("/", verifyToken, createPost); 

// Оновити пост (verifyToken + перевірка власності всередині контролера)
router.put("/:id", verifyToken, updatePost); 

// Видалити пост
router.delete("/:id", verifyToken, deletePost); 

export default router;
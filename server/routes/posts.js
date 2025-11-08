import express from "express";
import { getAllPosts, getPostById, createPost, updatePost, deletePost } from "../controllers/postsController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.get("/", getAllPosts);
router.get("/:id", getPostById);

router.post("/", verifyToken, createPost); 
router.put("/:id", verifyToken, updatePost); 
router.delete("/:id", verifyToken, deletePost); 

export default router;
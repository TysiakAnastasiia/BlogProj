import express from "express";
import { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie } from "../controllers/moviesController.js";
import { verifyToken } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.get("/", getAllMovies);
router.get("/:id", getMovieById);

router.post("/", verifyToken, createMovie); 
router.put("/:id", verifyToken, updateMovie);
router.delete("/:id", verifyToken, deleteMovie); 

export default router;
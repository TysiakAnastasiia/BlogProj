import express from "express";
const router = express.Router();

// GET всі пости
router.get("/", (req, res) => {
  res.json({ message: "GET all posts" });
});

// GET один пост
router.get("/:id", (req, res) => {
  res.json({ message: `GET post ${req.params.id}` });
});

// POST додати пост
router.post("/", (req, res) => {
  res.json({ message: "POST add post" });
});

// PUT редагувати пост
router.put("/:id", (req, res) => {
  res.json({ message: `PUT update post ${req.params.id}` });
});

// DELETE видалити пост
router.delete("/:id", (req, res) => {
  res.json({ message: `DELETE post ${req.params.id}` });
});

// ОБОВ'ЯЗКОВО export
export default router;

